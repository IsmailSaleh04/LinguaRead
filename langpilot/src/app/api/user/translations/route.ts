import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';
import { query } from '@/db/db';

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
    const { wordId, translation, context } = body;

    if (!wordId || !translation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Word ID and translation required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO user_word_translations (user_id, word_id, translation, context)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, word_id) DO UPDATE SET
         translation = $3,
         context = $4,
         created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [user.userId, wordId, translation, context]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    }, { status: 201 });

  } catch (error) {
    console.error('Save translation error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
