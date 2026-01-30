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
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = `
      SELECT uw.*, w.text, w.language_code, w.difficulty_level, w.part_of_speech
      FROM user_words uw
      JOIN words w ON uw.word_id = w.id
      WHERE uw.user_id = $1
    `;
    
    const params: any[] = [user.userId];
    let paramCount = 1;

    if (language) {
      paramCount++;
      queryText += ` AND w.language_code = $${paramCount}`;
      params.push(language);
    }

    if (status) {
      paramCount++;
      queryText += ` AND uw.status = $${paramCount}`;
      params.push(status);
    }

    paramCount++;
    queryText += ` ORDER BY uw.last_seen_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Get user words error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

