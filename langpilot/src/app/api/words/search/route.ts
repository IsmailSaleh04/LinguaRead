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
    const text = searchParams.get('text');
    const language = searchParams.get('language') || 'en';

    if (!text) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Search text required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT w.*, uw.status
       FROM words w
       LEFT JOIN user_words uw ON w.id = uw.word_id AND uw.user_id = $1
       WHERE w.text LIKE $2 AND w.language_code = $3
       ORDER BY w.frequency_rank ASC NULLS LAST
       LIMIT 10`,
      [user.userId, `%${text}%`, language]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Search words error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

