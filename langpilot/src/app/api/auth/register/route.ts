import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/db';
import { hashPassword } from '@/lib/auth';
import { signJWT, signRefreshToken } from '@/lib/jwt';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nativeLanguage } = body;

    // Validation
    if (!email || !password || !nativeLanguage) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (email, password_hash, native_language_code) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, native_language_code, created_at`,
      [email, passwordHash, nativeLanguage]
    );

    const user = result.rows[0];

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
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
