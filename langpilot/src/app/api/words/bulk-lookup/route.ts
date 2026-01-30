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
    const { words, language } = body;

    if (!words || !Array.isArray(words)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Words array required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT w.*, uw.status
       FROM words w
       LEFT JOIN user_words uw ON w.id = uw.word_id AND uw.user_id = $1
       WHERE w.text = ANY($2) AND w.language_code = $3`,
      [user.userId, words, language || 'en']
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Bulk lookup error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
