import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';
import { query } from '@/db/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const idParam = typeof id === 'string' ? id : '';

  if (!/^\d+$/.test(idParam)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Invalid article id' },
      { status: 400 }
    );
  }

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await query(
      `SELECT a.*, ARRAY_AGG(DISTINCT t.name) as topics
       FROM articles a
       LEFT JOIN article_topics at ON a.id = at.article_id
       LEFT JOIN topics t ON at.topic_id = t.id
       WHERE a.id = $1
       GROUP BY a.id`,
      [idParam]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Get article error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
