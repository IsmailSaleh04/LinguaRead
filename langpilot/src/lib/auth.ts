import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { verifyJWT } from './jwt';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token);
  
  if (!payload || !payload.userId) {
    return null;
  }

  return { userId: payload.userId as string };
}

