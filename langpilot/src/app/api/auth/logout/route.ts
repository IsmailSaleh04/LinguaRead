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

    // In a real app, you'd invalidate the refresh token in DB
    // For now, just return success (client will delete tokens)
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: 'Logged out successfully' },
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nativeLanguage } = body;

    if (!nativeLanguage) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Native language required' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE users 
       SET native_language_code = $1 
       WHERE id = $2 
       RETURNING id, email, native_language_code`,
      [nativeLanguage, user.userId]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

