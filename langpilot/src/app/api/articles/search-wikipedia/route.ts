import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/db/db';
import { ApiResponse } from '@/lib/types';

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
    const { searchQuery, language } = body;

    // Search Wikipedia
    const searchUrl = `https://${language}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchQuery)}&limit=10&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const [, titles, descriptions, urls] = await searchResponse.json();

    // Get user's known words to calculate match percentage
    const userWordsResult = await query(
      `SELECT w.text FROM user_words uw
       JOIN words w ON uw.word_id = w.id
       WHERE uw.user_id = $1 AND w.language_code = $2 AND uw.status = 'known'`,
      [user.userId, language]
    );

    const knownWords = new Set(userWordsResult.rows.map(r => r.text.toLowerCase()));

    // Fetch and analyze each article
    const results = await Promise.all(
      titles.map(async (title: string, index: number) => {
        try {
          // Get article summary
          const summaryUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
          const summaryRes = await fetch(summaryUrl);
          const summary = await summaryRes.json();

          // Quick word analysis on extract
          const text = summary.extract || '';
          const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
          const uniqueWords = [...new Set(words)];
          const knownCount = uniqueWords.filter(w => knownWords.has(w)).length;
          const matchPercentage = uniqueWords.length > 0 
            ? Math.round((knownCount / uniqueWords.length) * 100)
            : 0;

          return {
            title,
            description: descriptions[index],
            url: urls[index],
            summary: summary.extract,
            thumbnail: summary.thumbnail?.source,
            wordCount: words.length,
            matchPercentage,
          };
        } catch (error) {
          return null;
        }
      })
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: results.filter(r => r !== null),
    });

  } catch (error) {
    console.error('Wikipedia search error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
