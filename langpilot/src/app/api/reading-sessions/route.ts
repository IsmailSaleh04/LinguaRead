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
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Article ID required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO reading_sessions (user_id, article_id, started_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [user.userId, articleId]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    }, { status: 201 });

  } catch (error) {
    console.error('Start session error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

