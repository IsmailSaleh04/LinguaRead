import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';
import { query } from '@/db/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');

    // Get vocabulary stats
    let vocabQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE uw.status = 'known') as total_known_words,
        COUNT(*) FILTER (WHERE uw.status = 'learning') as total_learning_words
      FROM user_words uw
      JOIN words w ON uw.word_id = w.id
      WHERE uw.user_id = $1
    `;
    const vocabParams: any[] = [user.userId];
    
    if (language) {
      vocabQuery += ' AND w.language_code = $2';
      vocabParams.push(language);
    }

    const vocabResult = await query(vocabQuery, vocabParams);

    // Get reading stats
    let readingQuery = `
      SELECT 
        COUNT(*) as total_articles_read,
        SUM(time_spent_seconds) as total_reading_time,
        SUM(words_learned) as total_words_from_reading
      FROM reading_sessions rs
      JOIN articles a ON rs.article_id = a.id
      WHERE rs.user_id = $1 AND rs.completed_at IS NOT NULL
    `;
    const readingParams: any[] = [user.userId];
    
    if (language) {
      readingQuery += ' AND a.language_code = $2';
      readingParams.push(language);
    }

    const readingResult = await query(readingQuery, readingParams);

    // Calculate streak (consecutive days with activity)
    const streakResult = await query(
      `WITH RECURSIVE date_series(date, days_back) AS (
        SELECT CURRENT_DATE::date, 0
        UNION ALL
        SELECT (date - 1)::date, days_back + 1
        FROM date_series
        WHERE days_back < 100
      )
       SELECT COUNT(*) as streak
       FROM date_series ds
       WHERE EXISTS (
         SELECT 1 FROM user_progress up
         WHERE up.user_id = $1
           AND up.date = ds.date
           ${language ? 'AND up.language_code = $2' : ''}
       )
       AND NOT EXISTS (
         SELECT 1 FROM date_series ds2
         WHERE ds2.date > ds.date
           AND ds2.date <= CURRENT_DATE
           AND NOT EXISTS (
             SELECT 1 FROM user_progress up2
             WHERE up2.user_id = $1
               AND up2.date = ds2.date
               ${language ? 'AND up2.language_code = $2' : ''}
           )
       )`,
      language ? [user.userId, language] : [user.userId]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        vocabulary: vocabResult.rows[0],
        reading: readingResult.rows[0],
        currentStreak: streakResult.rows[0]?.streak || 0,
      },
    });

  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

