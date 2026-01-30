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

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await query(
      `SELECT a.*, ARRAY_AGG(DISTINCT t.name) as topics
       FROM articles a
       JOIN article_topics at ON a.id = at.article_id
       LEFT JOIN article_topics at2 ON a.id = at2.article_id
       LEFT JOIN topics t ON at2.topic_id = t.id
       WHERE at.topic_id = $1 AND a.language_code = $2
       GROUP BY a.id
       ORDER BY a.created_at DESC
       LIMIT $3 OFFSET $4`,
      [id, language, limit, offset]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Get topic articles error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
