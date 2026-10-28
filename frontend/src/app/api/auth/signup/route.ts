import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerDb } from '@/lib/server/db';
import { hashPassword, createSessionToken, setAuthCookie } from '@/lib/server/auth';

const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  orgName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid registration data' },
        { status: 400 }
      );
    }

    const { name, email, password, orgName } = parsed.data;
    const db = getServerDb();

    // Check if user email already exists
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await db.createUser(email, name, passwordHash);

    // Create organization
    const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const org = await db.createOrganization(orgName, orgSlug, user.id);

    // Create default project & ingest key
    const { project, key } = await db.createProject(org.id, `${orgName} Web App`, 'react');

    // Create session token & cookie
    const token = await createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      org: { id: org.id, name: org.name, slug: org.slug, plan: org.plan },
      project: { id: project.id, name: project.name, slug: project.slug },
      ingestKey: key.rawKey,
    });

    setAuthCookie(response, token);

    db.recordAuditLog({
      organizationId: org.id,
      actor: { id: user.id, name: user.name, email: user.email },
      action: 'auth.signup',
      resource: 'user',
      targetId: user.id,
      newValue: email,
      result: 'success',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
