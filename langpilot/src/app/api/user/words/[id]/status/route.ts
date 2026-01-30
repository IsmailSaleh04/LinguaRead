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
    const { status } = body;

    if (!['unknown', 'learning', 'known'].includes(status)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Upsert user word
    const result = await query(
      `INSERT INTO user_words (user_id, word_id, status, exposure_count, last_seen_at, marked_known_at)
       VALUES ($1, $2, $3, 1, CURRENT_TIMESTAMP, ${status === 'known' ? 'CURRENT_TIMESTAMP' : 'NULL'})
       ON CONFLICT (user_id, word_id) 
       DO UPDATE SET 
         status = $3,
         exposure_count = user_words.exposure_count + 1,
         last_seen_at = CURRENT_TIMESTAMP,
         marked_known_at = CASE WHEN $3 = 'known' THEN CURRENT_TIMESTAMP ELSE user_words.marked_known_at END
       RETURNING *`,
      [user.userId, id, status]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Update word status error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

