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

    const result = await query(
      `SELECT t.*, COUNT(at.article_id) as article_count
       FROM topics t
       LEFT JOIN article_topics at ON t.id = at.topic_id
       GROUP BY t.id
       ORDER BY t.name ASC`
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Get topics error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
