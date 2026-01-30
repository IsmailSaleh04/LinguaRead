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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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

    // Remove obvious non-content
    $("script, style, figure, figcaption, table").remove();
    $("sup.reference").remove();
    $("ol.references").remove();

    // Remove entire non-content sections
    $("section").each((_, section) => {
      const heading = $(section).find("h2, h3").first().text().toLowerCase();

      if (
        heading.includes("see also") ||
        heading.includes("references") ||
        heading.includes("external links") ||
        heading.includes("further reading") ||
        heading.includes("notes")
      ) {
        $(section).remove();
      }
    });

    // Extract paragraph text only
    const paragraphs = $("p")
      .map((_, p) => $(p).text().trim())
      .get()
      .filter((p) => p.split(" ").length > 5);

    const text = paragraphs.join("\n\n");

    if (!text) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No usable article content found" },
        { status: 422 },
      );
    }

    // Get article summary and metadata (includes categories)
    const summaryUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const summaryRes = await fetch(summaryUrl);
    const summary = await summaryRes.json();

    // Get categories from Wikipedia
    const categoriesUrl = `https://${language}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=categories&format=json&origin=*`;
    const categoriesRes = await fetch(categoriesUrl);
    const categoriesData = await categoriesRes.json();
    
    const pages = categoriesData.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    const categories = pages[pageId]?.categories || [];
    
    // Extract category names and map to our topics
    const categoryNames = categories.map((cat: any) => 
      cat.title.replace('Category:', '').toLowerCase()
    );

    // Match Wikipedia categories to our topics
    const topicsResult = await query('SELECT id, name, slug FROM topics');
    const allTopics = topicsResult.rows;
    
    const matchedTopics = allTopics.filter(topic => {
      const topicLower = topic.name.toLowerCase();
      return categoryNames.some((cat: string) => 
        cat.includes(topicLower) || topicLower.includes(cat)
      );
    });

    // Tokenize and analyze
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const uniqueWords = [...new Set(words)];

    // Check which words user knows
    const userWords = await query(
      `SELECT w.text, uw.status 
       FROM user_words uw
       JOIN words w ON uw.word_id = w.id
       WHERE uw.user_id = $1 AND w.text = ANY($2) AND w.language_code = $3`,
      [user.userId, uniqueWords, language]
    );

    const knownCount = userWords.rows.filter(w => w.status === 'known').length;
    const matchPercentage = Math.round((knownCount / uniqueWords.length) * 100);

    // Calculate difficulty score (0-1)
    const difficultyScore = 1 - (knownCount / uniqueWords.length);

    // Create article in database
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
      [title, summary.extract, summary.content_urls.desktop.page, language, 
       words.length, uniqueWords.length, difficultyScore, text]
    );

    const article = articleResult.rows[0];

    // Link matched topics to article
    for (const topic of matchedTopics) {
      await query(
        `INSERT INTO article_topics (article_id, topic_id)
         VALUES ($1, $2)
         ON CONFLICT (article_id, topic_id) DO NOTHING`,
        [article.id, topic.id]
      );
    }

    // Create words and link to article
    const wordsInDb = await query(
      `SELECT id, text FROM words WHERE text = ANY($1) AND language_code = $2`,
      [uniqueWords, language]
    );

    const existingWordMap = new Map(wordsInDb.rows.map((w: any) => [w.text, w.id]));

    for (const word of uniqueWords) {
      let wordId = existingWordMap.get(word);
      
      if (!wordId) {
        const newWord = await query(
          `INSERT INTO words (text, language_code) 
           VALUES ($1, $2) 
           ON CONFLICT (text, language_code) DO UPDATE SET text = $1
           RETURNING id`,
          [word, language]
        );
        wordId = newWord.rows[0].id;
              await query(
        `INSERT INTO article_words (article_id, word_id, occurrence_count)
         VALUES ($1, $2, $3)
         ON CONFLICT (article_id, word_id) DO UPDATE SET occurrence_count = $3`,
        [article.id, wordId, words.filter(w => w === word).length]
      );
      }

    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        article: {
          ...article,
          matchPercentage,
          topics: matchedTopics.map(t => t.name),
        },
        wordData: uniqueWords.map(word => ({
          text: word,
          status: userWords.rows.find((uw: any) => uw.text === word)?.status || 'unknown',
        })),
      },
    });

  } catch (error) {
    console.error('Fetch Wikipedia article error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
