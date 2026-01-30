import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';
import { query } from '@/db/db';

export async function GET(
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

    // Get all words in the article that user hasn't marked as known
    const result = await query(
      `SELECT w.*, aw.occurrence_count, 
              COALESCE(uw.status, 'unknown') as status
       FROM article_words aw
       JOIN words w ON aw.word_id = w.id
       LEFT JOIN user_words uw ON w.id = uw.word_id AND uw.user_id = $1
       WHERE aw.article_id = $2 
         AND (uw.status IS NULL OR uw.status != 'known')
       ORDER BY w.frequency_rank ASC NULLS LAST`,
      [user.userId, id]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Get unknown words error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

