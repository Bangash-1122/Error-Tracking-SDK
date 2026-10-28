import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/server/auth';
import { getServerDb } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const db = getServerDb();
  const user = await db.getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const orgs = await db.listUserOrganizations(user.id);
  const memberships = await Promise.all(
    orgs.map(async (org) => {
      const mem = await db.getMembership(org.id, user.id);
      return {
        org,
        role: mem?.role || 'member',
      };
    })
  );

  return NextResponse.json({
    authenticated: true,
    user: { id: user.id, name: user.name, email: user.email },
    organizations: memberships,
  });
}
