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
    const period = searchParams.get('period') || 'week'; // day, week, month, year

    let daysBack = 7;
    if (period === 'day') daysBack = 1;
    else if (period === 'month') daysBack = 30;
    else if (period === 'year') daysBack = 365;

    let queryText = `
      SELECT date, words_learned, articles_read, time_spent_seconds
      FROM user_progress
      WHERE user_id = $1
        AND date >= CURRENT_DATE - INTERVAL '${daysBack} days'
    `;

    const params: any[] = [user.userId];

    if (language) {
      queryText += ' AND language_code = $2';
      params.push(language);
    }

    queryText += ' ORDER BY date ASC';

    const result = await query(queryText, params);

    // Calculate totals
    const totals = result.rows.reduce((acc, row) => ({
      totalWordsLearned: acc.totalWordsLearned + row.words_learned,
      totalArticlesRead: acc.totalArticlesRead + row.articles_read,
      totalTimeSeconds: acc.totalTimeSeconds + row.time_spent_seconds,
    }), { totalWordsLearned: 0, totalArticlesRead: 0, totalTimeSeconds: 0 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        dailyProgress: result.rows,
        totals,
        period,
      },
    });

  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
