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

    let queryText = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'known') as known,
        COUNT(*) FILTER (WHERE status = 'learning') as learning,
        COUNT(*) FILTER (WHERE status = 'unknown') as unknown,
        COUNT(*) as total
      FROM user_words uw
      JOIN words w ON uw.word_id = w.id
      WHERE uw.user_id = $1
    `;

    const params: any[] = [user.userId];
    
    if (language) {
      queryText += ' AND w.language_code = $2';
      params.push(language);
    }

    const result = await query(queryText, params);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Get word stats error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

