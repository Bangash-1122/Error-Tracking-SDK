import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { getServerDb, UserRecord, OrganizationRecord, MembershipRecord } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'errorpulse-super-secret-production-jwt-key-minimum-32-chars!'
);

const TOKEN_COOKIE_NAME = 'auth_token';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export async function createSessionToken(user: UserRecord): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.userId || !payload.email) return null;
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: (payload.name as string) || '',
    };
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getAuthSession(req: NextRequest): Promise<AuthSession | null> {
  // Check cookie first
  const cookie = req.cookies.get(TOKEN_COOKIE_NAME);
  if (cookie?.value) {
    const session = await verifySessionToken(cookie.value);
    if (session) return session;
  }

  // Check Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const session = await verifySessionToken(token);
    if (session) return session;
  }

  return null;
}

export async function requireAuthUser(req: NextRequest): Promise<{
  user: UserRecord;
  session: AuthSession;
}> {
  const session = await getAuthSession(req);
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  const db = getServerDb();
  const user = await db.getUserById(session.userId);
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return { user, session };
}

export async function requireOrgAccess(
  req: NextRequest,
  orgSlugOrId: string,
  minRole?: 'owner' | 'admin' | 'member'
): Promise<{
  user: UserRecord;
  org: OrganizationRecord;
  membership: MembershipRecord;
}> {
  const { user } = await requireAuthUser(req);
  const db = getServerDb();

  let org = await db.getOrganizationBySlug(orgSlugOrId);
  if (!org) {
    org = await db.getOrganizationById(orgSlugOrId);
  }
  if (!org) {
    throw new Error('ORGANIZATION_NOT_FOUND');
  }

  const membership = await db.getMembership(org.id, user.id);
  if (!membership) {
    throw new Error('FORBIDDEN');
  }

  if (minRole) {
    const roleRank: Record<string, number> = { owner: 3, admin: 2, member: 1 };
    if ((roleRank[membership.role] || 0) < (roleRank[minRole] || 1)) {
      throw new Error('INSUFFICIENT_PERMISSIONS');
    }
  }

  return { user, org, membership };
}
