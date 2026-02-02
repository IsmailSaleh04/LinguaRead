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
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [user.userId]
    );

    if (result.rows.length === 0) {
      // Create default preferences
      const defaultPrefs = await query(
        `INSERT INTO user_preferences (user_id) 
         VALUES ($1) 
         RETURNING *`,
        [user.userId]
      );
      return NextResponse.json<ApiResponse>({
        success: true,
        data: defaultPrefs.rows[0],
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      preferred_topics,          // ← match frontend snake_case
      daily_goal_minutes,
      auto_suggest_enabled,
      difficulty_preference
    } = body;

    // Log incoming data for debug
    console.log('Updating preferences for user', user.userId, { preferred_topics });

    const result = await query(
      `
      INSERT INTO user_preferences (
        user_id, preferred_topics, daily_goal_minutes,
        auto_suggest_enabled, difficulty_preference, updated_at
      )
      VALUES ($1, $2::integer[], $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        preferred_topics = $2::integer[],
        daily_goal_minutes = COALESCE($3, user_preferences.daily_goal_minutes),
        auto_suggest_enabled = COALESCE($4, user_preferences.auto_suggest_enabled),
        difficulty_preference = COALESCE($5, user_preferences.difficulty_preference),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [
        user.userId,
        preferred_topics ?? null,  // allow clearing to NULL or send []
        daily_goal_minutes,
        auto_suggest_enabled,
        difficulty_preference
      ]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}