import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types';
import { query } from '@/db/db';
import { verifyPassword } from '@/lib/auth';
import { signJWT, signRefreshToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing email or password' },
        { status: 400 }
      );
    }

    // Get user
    const result = await query(
      'SELECT id, email, password_hash, native_language_code FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last active
    await query(
      'UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const accessToken = await signJWT({ userId: user.id });
    const refreshToken = await signRefreshToken({ userId: user.id });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          nativeLanguage: user.native_language_code,
        },
        accessToken,
        refreshToken,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
