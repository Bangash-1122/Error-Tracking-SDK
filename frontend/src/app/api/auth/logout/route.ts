import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie, getAuthSession } from '@/lib/server/auth';
import { getServerDb } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  const db = getServerDb();

  if (session) {
    const orgs = await db.listUserOrganizations(session.userId);
    if (orgs.length > 0) {
      db.recordAuditLog({
        organizationId: orgs[0].id,
        actor: { id: session.userId, name: session.name, email: session.email },
        action: 'auth.logout',
        resource: 'session',
        targetId: session.userId,
        result: 'success',
      });
    }
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  clearAuthCookie(response);
  return response;
}
