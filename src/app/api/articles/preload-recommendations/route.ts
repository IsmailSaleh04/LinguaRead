import { query } from "@/db/db";
import { getUserFromRequest } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

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
    const { language } = body;

    // Get user's proficiency level and preferred topics
    const [levelResult, prefsResult] = await Promise.all([
      query(
        'SELECT proficiency_level FROM user_target_languages WHERE user_id = $1 AND language_code = $2',
        [user.userId, language]
      ),
      query(
        'SELECT preferred_topics FROM user_preferences WHERE user_id = $1',
        [user.userId]
      ),
    ]);

    const proficiency = levelResult.rows[0]?.proficiency_level || 'A1';
    const preferredTopics = prefsResult.rows[0]?.preferred_topics || [];

    // Get topic names
    const topicsResult = await query(
      'SELECT name FROM topics WHERE id = ANY($1)',
      [preferredTopics]
    );
    const topicNames = topicsResult.rows.map((t: any) => t.name);

    // Search Wikipedia for articles in user's topics
    const recommendations = [];
    
    for (const topicName of topicNames.slice(0, 3)) { // Limit to 3 topics
      const searchUrl = `https://${language}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(topicName)}&limit=3&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      const [, titles, descriptions, urls] = await searchRes.json();

      for (let i = 0; i < titles.length; i++) {
        // Quick analysis
        const summaryUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titles[i])}`;
        const summaryRes = await fetch(summaryUrl);
        const summary = await summaryRes.json();

        const text = summary.extract || '';
        const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
        const uniqueWords = [...new Set(words)];

        // Check known words
        const knownWords = await query(
          `SELECT COUNT(*) as count FROM user_words uw
           JOIN words w ON uw.word_id = w.id
           WHERE uw.user_id = $1 AND w.language_code = $2 
           AND uw.status = 'known' AND w.text = ANY($3)`,
          [user.userId, language, uniqueWords]
        );

        const knownCount = parseInt(knownWords.rows[0].count);
        const matchPercentage = uniqueWords.length > 0
          ? Math.round((knownCount / uniqueWords.length) * 100)
          : 0;

        recommendations.push({
          title: titles[i],
          description: descriptions[i],
          url: urls[i],
          summary: summary.extract,
          thumbnail: summary.thumbnail?.source,
          wordCount: words.length,
          matchPercentage,
          topic: topicName,
        });
      }
    }

    // Sort by match percentage (prefer 40-70% range)
    recommendations.sort((a, b) => {
      const aScore = Math.abs(55 - a.matchPercentage); // 55 is middle of 40-70
      const bScore = Math.abs(55 - b.matchPercentage);
      return aScore - bScore;
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: recommendations.slice(0, 10),
    });

  } catch (error) {
    console.error('Preload recommendations error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to load recommendations' },
      { status: 500 }
    );
  }
}
