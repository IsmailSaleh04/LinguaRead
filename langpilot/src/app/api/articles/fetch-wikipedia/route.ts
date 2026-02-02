import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { query } from "@/db/db";
import { getUserFromRequest } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, language = "en" } = await request.json();

    if (!title) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // ───────────────────────────────────────────────
    // 1. Fetch full Parsoid HTML
    // ───────────────────────────────────────────────
    const htmlUrl = `https://${language}.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`;
    const htmlRes = await fetch(htmlUrl, {
      headers: { "Accept": "text/html; charset=utf-8" },
    });

    if (!htmlRes.ok) {
      throw new Error(`Wikipedia returned ${htmlRes.status}`);
    }

    let html = await htmlRes.text();

    // ───────────────────────────────────────────────
    // 2. Clean HTML with cheerio
    // ───────────────────────────────────────────────
    const $ = cheerio.load(html, { xmlMode: true }); // xmlMode helps preserve self-closing tags

    // Remove unwanted elements (very aggressive cleaning)
    $(
      "script, style, noscript, iframe, form, input, button, nav, footer, .mw-editsection, " +
      ".mw-jump-link, .mw-ref, .reference, .mw-cite-backlink, .infobox-above, " +
      ".hatnote, .sidebar, .portal, .navbox, .reflist, .sistersitebox, " +
      ".mw-indicators, .mw-metadata, .mw-kartographer-container, .ambox"
    ).remove();

    // Remove reference sections and see-also / external links
    $("h2, h3, h4").each((_, el) => {
      const text = $(el).text().toLowerCase().trim();
      if (
        text.includes("references") ||
        text.includes("see also") ||
        text.includes("external links") ||
        text.includes("notes") ||
        text.includes("bibliography") ||
        text.includes("further reading")
      ) {
        let next = $(el).next();
        while (next.length && !next.is("h2, h3, h4")) {
          next.remove();
          next = next.next();
        }
        $(el).remove();
      }
    });

    // Remove empty paragraphs and very short ones
    $("p").each((_, p) => {
      const txt = $(p).text().trim();
      if (txt.length < 40 || txt.split(/\s+/).length < 6) {
        $(p).remove();
      }
    });

    // Keep only the main content wrapper (mw-parser-output)
    const content = $(".mw-parser-output").html() || "";
    if (!content.trim()) {
      throw new Error("No usable content after cleaning");
    }

    // ───────────────────────────────────────────────
    // 3. Get metadata / summary / categories
    // ───────────────────────────────────────────────
    const summaryUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const summaryRes = await fetch(summaryUrl);
    const summaryJson = await summaryRes.json();

    const pageUrl = summaryJson.content_urls?.desktop?.page || `https://${language}.wikipedia.org/wiki/${title}`;

    // Categories
    const catRes = await fetch(
      `https://${language}.wikipedia.org/w/api.php?action=query&prop=categories&titles=${encodeURIComponent(title)}&format=json&cllimit=50`
    );
    const catJson = await catRes.json();
    const page = Object.values(catJson.query.pages)[0] as any;
    const categories = (page?.categories || []).map((c: any) => c.title.replace(/^Category:/, "").trim());

    // ───────────────────────────────────────────────
    // 4. Match categories → topics
    // ───────────────────────────────────────────────
    const topicsRes = await query("SELECT id, name FROM topics");
    const topics = topicsRes.rows;

    const matchedTopicIds = topics
      .filter(t => categories.some((cat: string) => 
        cat.toLowerCase().includes(t.name.toLowerCase()) || 
        t.name.toLowerCase().includes(cat.toLowerCase())
      ))
      .map(t => t.id);

    // ───────────────────────────────────────────────
    // 5. Extract plain text for word analysis
    // ───────────────────────────────────────────────
    const plainText = cheerio.load(`<div>${content}</div>`).text().trim();
    const words = plainText.toLowerCase().match(/\b[a-zà-ÿ]{2,}\b/g) || [];
    const uniqueWords = [...new Set(words)];

    const wordCount = words.length;
    const uniqueWordCount = uniqueWords.length;

    // ───────────────────────────────────────────────
    // 6. User known words → match percentage
    // ───────────────────────────────────────────────
    const userWordsRes = await query(
      `SELECT w.text, uw.status
       FROM user_words uw
       JOIN words w ON uw.word_id = w.id
       WHERE uw.user_id = $1 
         AND w.text = ANY($2) 
         AND w.language_code = $3`,
      [user.userId, uniqueWords, language]
    );

    const knownWords = userWordsRes.rows.filter(r => r.status === "known");
    const matchPercentage = uniqueWordCount > 0 
      ? Math.round((knownWords.length / uniqueWordCount) * 100)
      : 0;

    const difficultyScore = 1 - (knownWords.length / uniqueWordCount) || 0.5;

    // ───────────────────────────────────────────────
    // 7. Save / update article
    // ───────────────────────────────────────────────
const articleRes = await query(
  `INSERT INTO articles (
    title, summary, source_url, language_code, 
    word_count, unique_word_count, difficulty_score, 
    cached_content, source_type
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'wikipedia')
  ON CONFLICT (source_url) DO UPDATE SET
    cached_content = EXCLUDED.cached_content,
    word_count = EXCLUDED.word_count,
    unique_word_count = EXCLUDED.unique_word_count,
    difficulty_score = EXCLUDED.difficulty_score
  RETURNING id, title, summary, source_url, language_code, cached_content`,
  [
    title,
    summaryJson.extract || "",
    pageUrl,
    language,
    wordCount,
    uniqueWordCount,
    difficultyScore,
    content,           // ← full cleaned HTML
  ]
);

const article = articleRes.rows[0];

    // Link topics
    if (matchedTopicIds.length > 0) {
      for (const topicId of matchedTopicIds) {
        await query(
          `INSERT INTO article_topics (article_id, topic_id) 
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [article.id, topicId]
        );
      }
    }

    // ───────────────────────────────────────────────
    // 8. Upsert words & article_words links
    // ───────────────────────────────────────────────
    if (uniqueWords.length > 0) {
      // Get existing words
      const existingWords = await query(
        `SELECT id, text FROM words 
         WHERE text = ANY($1) AND language_code = $2`,
        [uniqueWords, language]
      );

      const wordIdMap = new Map(existingWords.rows.map(r => [r.text, r.id]));

      for (const word of uniqueWords) {
        let wordId = wordIdMap.get(word);

        if (!wordId) {
          const newWord = await query(
            `INSERT INTO words (text, language_code) 
             VALUES ($1, $2) 
             ON CONFLICT (text, language_code) DO UPDATE SET text = $1
             RETURNING id`,
            [word, language]
          );
          wordId = newWord.rows[0].id;

                  const count = words.filter(w => w === word).length;

        await query(
          `INSERT INTO article_words (article_id, word_id, occurrence_count)
           VALUES ($1, $2, $3)
           ON CONFLICT (article_id, word_id) 
           DO UPDATE SET occurrence_count = $3`,
          [article.id, wordId, count]
        );
        }

        // Count occurrences

      }
    }

    // ───────────────────────────────────────────────
    // 9. Return minimal useful data
    // ───────────────────────────────────────────────
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        articleId: article.id,
        title: article.title,
        url: article.source_url,
        language: article.language_code,
        matchPercentage,
        difficultyScore: Math.round(difficultyScore * 100) / 100,
      }
    });

  } catch (err: any) {
    console.error("Wikipedia fetch failed:", err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}