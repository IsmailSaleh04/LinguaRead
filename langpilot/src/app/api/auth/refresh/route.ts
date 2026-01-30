import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types';
import { signJWT, verifyRefreshToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Refresh token required' },
        { status: 400 }
      );
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new access token
    const accessToken = await signJWT({ userId: payload.userId });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { accessToken },
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
