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
      `SELECT utl.language_code, utl.proficiency_level, utl.started_at,
              l.name, l.native_name
       FROM user_target_languages utl
       JOIN languages l ON utl.language_code = l.code
       WHERE utl.user_id = $1
       ORDER BY utl.started_at DESC`,
      [user.userId]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Get target languages error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ADD TARGET LANGUAGE
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
    const { languageCode, proficiencyLevel } = body;

    if (!languageCode) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Language code required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO user_target_languages (user_id, language_code, proficiency_level)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, language_code) DO NOTHING
       RETURNING *`,
      [user.userId, languageCode, proficiencyLevel || 'A1']
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Language already added' },
        { status: 409 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    }, { status: 201 });

  } catch (error) {
    console.error('Add target language error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

