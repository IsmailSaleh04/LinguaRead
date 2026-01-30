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
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user's proficiency level for the language
    const proficiencyResult = await query(
      'SELECT proficiency_level FROM user_target_languages WHERE user_id = $1 AND language_code = $2',
      [user.userId, language]
    );

    const proficiency = proficiencyResult.rows[0]?.proficiency_level || 'A1';

    // Get user preferences
    const prefsResult = await query(
      'SELECT preferred_topics FROM user_preferences WHERE user_id = $1',
      [user.userId]
    );

    const preferredTopics = prefsResult.rows[0]?.preferred_topics || [];

    // Find articles matching user's level and interests
    // This is a simplified recommendation - you'd want a more sophisticated algorithm
    let queryText = `
      SELECT DISTINCT a.*, 
             ARRAY_AGG(DISTINCT t.name) as topics,
             COUNT(DISTINCT aw.word_id) FILTER (
               WHERE uw.status IS NULL OR uw.status != 'known'
             ) as unknown_words_count
      FROM articles a
      LEFT JOIN article_topics at ON a.id = at.article_id
      LEFT JOIN topics t ON at.topic_id = t.id
      LEFT JOIN article_words aw ON a.id = aw.article_id
      LEFT JOIN user_words uw ON aw.word_id = uw.word_id AND uw.user_id = $1
      WHERE a.language_code = $2
        AND a.difficulty_score <= (
          CASE $3
            WHEN 'A1' THEN 0.3
            WHEN 'A2' THEN 0.4
            WHEN 'B1' THEN 0.6
            WHEN 'B2' THEN 0.8
            ELSE 1.0
          END
        )
        AND a.id NOT IN (
          SELECT article_id FROM reading_sessions 
          WHERE user_id = $1 AND completed_at IS NOT NULL
        )
    `;

    const params: any[] = [user.userId, language, proficiency];

    if (preferredTopics.length > 0) {
      queryText += ` AND at.topic_id = ANY($4)`;
      params.push(preferredTopics);
    }

    queryText += `
      GROUP BY a.id
      ORDER BY unknown_words_count DESC, a.created_at DESC
      LIMIT ${params.length + 1}
    `;
    params.push(limit);

    const result = await query(queryText, params);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Get recommended articles error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

