import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';
import { query } from '@/db/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { wordsLearned, totalTimeSeconds } = body;

    // Update session
    const sessionResult = await query(
      `UPDATE reading_sessions 
       SET completed_at = CURRENT_TIMESTAMP,
           words_learned = $1,
           time_spent_seconds = $2,
           progress_percentage = 100
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [wordsLearned, totalTimeSeconds, id, user.userId]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];

    // Get article language
    const articleResult = await query(
      'SELECT language_code FROM articles WHERE id = $1',
      [session.article_id]
    );

    const languageCode = articleResult.rows[0]?.language_code;

    // Update user progress stats
    if (languageCode) {
      await query(
        `INSERT INTO user_progress (user_id, language_code, date, words_learned, articles_read, time_spent_seconds)
         VALUES ($1, $2, CURRENT_DATE, $3, 1, $4)
         ON CONFLICT (user_id, language_code, date) DO UPDATE SET
           words_learned = user_progress.words_learned + $3,
           articles_read = user_progress.articles_read + 1,
           time_spent_seconds = user_progress.time_spent_seconds + $4`,
        [user.userId, languageCode, wordsLearned, totalTimeSeconds]
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: session,
    });

  } catch (error) {
    console.error('Complete session error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
