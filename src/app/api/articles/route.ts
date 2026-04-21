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
    const language = searchParams.get('language') || 'en';
    const difficulty = searchParams.get('difficulty');
    const topics = searchParams.get('topics')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = `
      SELECT a.id, a.title, a.summary, a.source_url, a.language_code, 
             a.word_count, a.difficulty_score, a.source_type,
             ARRAY_AGG(DISTINCT t.name) as topics
      FROM articles a
      LEFT JOIN article_topics at ON a.id = at.article_id
      LEFT JOIN topics t ON at.topic_id = t.id
      WHERE a.language_code = $1
    `;
    
    const params: any[] = [language];
    let paramCount = 1;

    if (difficulty) {
      paramCount++;
      queryText += ` AND a.difficulty_score = $${paramCount}`;
      params.push(difficulty);
    }

    queryText += ` GROUP BY a.id ORDER BY a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM articles WHERE language_code = $1',
      [language]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: Math.floor(offset / limit) + 1,
        limit,
      },
    });

  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
