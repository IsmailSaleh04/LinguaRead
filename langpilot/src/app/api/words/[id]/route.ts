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

    const result = await query(
      `SELECT w.*, uw.status, uw.exposure_count, uw.last_seen_at
       FROM words w
       LEFT JOIN user_words uw ON w.id = uw.word_id AND uw.user_id = $1
       WHERE w.id = $2`,
      [user.userId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Word not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Get word error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
