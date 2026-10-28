import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { requireAuthUser } from '@/lib/server/auth';
import { hashPassword } from '@/lib/server/auth';
import { z } from 'zod';

const InviteMemberSchema = z.object({
  organizationId: z.string().default('org_acme_corp'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['admin', 'member']).default('member'),
});

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get('orgId') || 'org_acme_corp';
    const db = getServerDb();
    const members = await db.listMembersByOrg(orgId);
    return NextResponse.json({
      members: members.map((m) => ({
        id: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        joinedAt: m.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = InviteMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid parameters' },
        { status: 400 }
      );
    }

    const { organizationId, name, email, role } = parsed.data;
    const db = getServerDb();

    let actor = { id: 'usr_admin_01', name: 'Admin User', email: 'admin@acme.com' };
    try {
      const auth = await requireAuthUser(req);
      actor = { id: auth.user.id, name: auth.user.name, email: auth.user.email };
    } catch {
      // Demo fallback
    }

    let user = await db.getUserByEmail(email);
    if (!user) {
      const defaultHash = await hashPassword('TemporaryPassword123!');
      user = await db.createUser(email, name, defaultHash);
    }

    const membership = await db.addMembership(organizationId, user.id, role);

    db.recordAuditLog({
      organizationId,
      actor,
      action: 'team.invite',
      resource: 'membership',
      targetId: user.id,
      newValue: `${email} (${role})`,
      result: 'success',
    });

    return NextResponse.json({
      success: true,
      member: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: membership.role,
        joinedAt: membership.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error inviting member' }, { status: 500 });
  }
}
