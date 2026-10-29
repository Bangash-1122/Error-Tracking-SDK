import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerDb } from '@/lib/server/db';
import { comparePassword, createSessionToken, setAuthCookie } from '@/lib/server/auth';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const db = getServerDb();
    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Rate limiting check
    if (!db.checkLoginRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 1 minute before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid credentials' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Retrieve user by email
    const user = await db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password hash
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user's organizations
    const orgs = await db.listUserOrganizations(user.id);
    const activeOrg = orgs[0] || null;

    // Issue JWT session token in HTTP-only cookie
    const token = await createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      defaultOrgSlug: activeOrg?.slug || 'acme-corp',
      organizations: orgs.map((o) => ({ id: o.id, name: o.name, slug: o.slug, plan: o.plan })),
    });

    setAuthCookie(response, token);

    if (activeOrg) {
      db.recordAuditLog({
        organizationId: activeOrg.id,
        actor: { id: user.id, name: user.name, email: user.email },
        action: 'auth.login',
        resource: 'session',
        targetId: user.id,
        result: 'success',
        ipAddress: clientIp,
      });
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
