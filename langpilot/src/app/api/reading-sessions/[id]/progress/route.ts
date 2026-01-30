import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';
import { query } from '@/db/db';

export async function PUT(
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

    const body = await request.json();
    const { progressPercentage, timeSpentSeconds } = body;

    const result = await query(
      `UPDATE reading_sessions 
       SET progress_percentage = $1,
           time_spent_seconds = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [progressPercentage, timeSpentSeconds, id, user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Update session progress error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
