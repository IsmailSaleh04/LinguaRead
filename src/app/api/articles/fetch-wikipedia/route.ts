import { query } from "@/db/db";
import { getUserFromRequest } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { title, language } = body;

    /* ---------------------------------------------
       Fetch Wikipedia HTML (Parsoid)
    ---------------------------------------------- */
    const articleUrl = `https://${language}.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(
      title,
    )}`;

    const htmlRes = await fetch(articleUrl);
    if (!htmlRes.ok) {
      throw new Error("Failed to fetch Wikipedia article");
    }

    const html = await htmlRes.text();

    /* ---------------------------------------------
       Parse + clean HTML
    ---------------------------------------------- */
    const $ = cheerio.load(html);

    // Step 1: Remove non-content chrome elements
    $(
      "script, style, noscript, iframe, form, input, button, " +
        "nav, footer, header, aside, .mw-editsection, .mw-jump-link, " +
        ".hatnote, .noprint, .portal, .navbox, .infobox, .sidebar, " +
        ".ambox, .tmbox, .ombox, .cmbox, .dmbox, .fmbox, " +
        ".reflist, .references, .mw-references-wrap, " +
        "sup.reference, .mw-cite-backlink, .citation, " +
        ".coordinates, .geo-default, .geo-dms, .geo-multi-punct, " +
        ".IPA, .audio-button, .pronunciation, " +
        '[role="navigation"], [aria-label*="navigation"], ' +
        ".mw-indicators, .mw-metadata, .mw-kartographer-container",
    ).remove();

    // Step 2: Remove disambiguation / hatnote noise
    $(".mbox-small, .dablink, .homonymie, .homophones, .homonymes").remove();

    // Step 3: Remove reference markers and small annotations but NOT all <sup>/<sub>
    // (some scripts legitimately use them for characters)
    $("sup.reference, .reference").remove();
    $("small.noprint").remove();

    // Step 4: Extract text from main content area.
    // NOTE: We intentionally do NOT filter elements by text length or character
    // set here because that would destroy non-Latin scripts (Arabic, CJK, etc.)
    const mainContent = $(".mw-parser-output").length
      ? $(".mw-parser-output")
      : $("body");

    let cleanText = mainContent
      .text()
      .replace(/\s*\[\d+\]\s*/g, "") // remove [1] [23] reference numbers
      .replace(/\s*\[citation needed\]\s*/gi, "")
      .replace(/\s*\[edit\]\s*/gi, "")
      .replace(/[\r\n]{3,}/g, "\n\n") // normalise blank lines
      .replace(/\s{2,}/g, " ") // collapse spaces
      .trim();

    // Step 5: Drop lines that are pure whitespace or very short AND contain
    // only ASCII punctuation/digits — this safely skips junk without touching
    // non-Latin content (Arabic, Japanese, Chinese, Korean, Russian, etc.)
    const lines = cleanText.split("\n").filter((line) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return false;
      // Keep if the line has at least one letter from any Unicode script
      if (/\p{L}/u.test(trimmed)) return true;
      // Drop lines that are only numbers / punctuation
      return false;
    });
    cleanText = lines.join("\n\n");

    if (!cleanText || cleanText.length < 200) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "No usable article content after cleaning",
        },
        { status: 422 },
      );
    }

    /* ---------------------------------------------
       Metadata & categories
    ---------------------------------------------- */
    const summaryUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const summaryRes = await fetch(summaryUrl);
    const summary = await summaryRes.json();

    const categoriesUrl = `https://${language}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=categories&format=json&origin=*`;
    const categoriesRes = await fetch(categoriesUrl);
    const categoriesData = await categoriesRes.json();

    const pages = categoriesData.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    const categories = pages[pageId]?.categories || [];

    const categoryNames = categories.map((cat: any) =>
      cat.title.replace("Category:", "").toLowerCase(),
    );

    const topicsResult = await query("SELECT id, name, slug FROM topics");
    const allTopics = topicsResult.rows;

    const matchedTopics = allTopics.filter((topic) => {
      const topicLower = topic.name.toLowerCase();
      return categoryNames.some(
        (cat: string) => cat.includes(topicLower) || topicLower.includes(cat),
      );
    });

    /* ---------------------------------------------
       Tokenise
    ---------------------------------------------- */
    // Use a unicode-aware regex so non-Latin words are captured too
    const words = cleanText.toLowerCase().match(/\p{L}[\p{L}'-]*/gu) || [];
    const uniqueWords = [...new Set(words)];

    /* ---------------------------------------------
       Vocabulary matching
    ---------------------------------------------- */
    const userWords = await query(
      `SELECT w.text, uw.status 
       FROM user_words uw
       JOIN words w ON uw.word_id = w.id
       WHERE uw.user_id = $1 AND w.text = ANY($2) AND w.language_code = $3`,
      [user.userId, uniqueWords, language],
    );

    const knownCount = userWords.rows.filter(
      (w) => w.status === "known",
    ).length;
    const matchPercentage = Math.round((knownCount / uniqueWords.length) * 100);
    const difficultyScore = 1 - knownCount / uniqueWords.length;

    /* ---------------------------------------------
       Upsert article
    ---------------------------------------------- */
    const articleResult = await query(
      `INSERT INTO articles (title, summary, source_url, language_code, word_count,
                            unique_word_count, difficulty_score, cached_content, source_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'wikipedia')
       ON CONFLICT (source_url) DO UPDATE SET
         cached_content = $8,
         word_count = $5,
         unique_word_count = $6,
         difficulty_score = $7
       RETURNING *`,
      [
        title,
        summary.extract,
        summary.content_urls.desktop.page,
        language,
        words.length,
        uniqueWords.length,
        difficultyScore,
        cleanText,
      ],
    );

    const article = articleResult.rows[0];

    // Link matched topics
    for (const topic of matchedTopics) {
      await query(
        `INSERT INTO article_topics (article_id, topic_id)
         VALUES ($1, $2)
         ON CONFLICT (article_id, topic_id) DO NOTHING`,
        [article.id, topic.id],
      );
    }

    /* ---------------------------------------------
       Upsert words + article_words
       FIX: we now link BOTH new AND pre-existing words to the article.
       Previously the article_words insert was inside the `if (!wordId)` block
       so pre-existing words were never linked.
    ---------------------------------------------- */
    const wordsInDb = await query(
      `SELECT id, text FROM words WHERE text = ANY($1) AND language_code = $2`,
      [uniqueWords, language],
    );

    const existingWordMap = new Map(
      wordsInDb.rows.map((w: any) => [w.text, w.id]),
    );

    for (const word of uniqueWords) {
      let wordId = existingWordMap.get(word);

      if (!wordId) {
        const newWord = await query(
          `INSERT INTO words (text, language_code)
           VALUES ($1, $2)
           ON CONFLICT (text, language_code) DO UPDATE SET text = $1
           RETURNING id`,
          [word, language],
        );
        wordId = newWord.rows[0].id;
      }

      // Always upsert article_words — covers both new and pre-existing words
      await query(
        `INSERT INTO article_words (article_id, word_id, occurrence_count)
         VALUES ($1, $2, $3)
         ON CONFLICT (article_id, word_id) DO UPDATE SET occurrence_count = $3`,
        [article.id, wordId, words.filter((w) => w === word).length],
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        article: {
          ...article,
          matchPercentage,
          topics: matchedTopics.map((t) => t.name),
        },
        wordData: uniqueWords.map((word) => ({
          text: word,
          status:
            userWords.rows.find((uw: any) => uw.text === word)?.status ||
            "unknown",
        })),
      },
    });
  } catch (error) {
    console.error("Fetch Wikipedia article error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch article" },
      { status: 500 },
    );
  }
}
