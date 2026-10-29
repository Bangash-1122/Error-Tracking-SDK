import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { getServerCache } from '@/lib/server/cache';
import { requireAuthUser } from '@/lib/server/auth';
import { hashPassword } from '@/lib/server/auth';
import { z } from 'zod';

const InviteMemberSchema = z.object({
  organizationId: z.string().default('org_acme_corp'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['admin', 'developer', 'viewer', 'member']).default('member'),
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching members';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
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

    const membershipRole = role === 'developer' || role === 'viewer' ? 'member' : role;
    const membership = await db.addMembership(organizationId, user.id, membershipRole);

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
        role,
        joinedAt: membership.createdAt,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error inviting member';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const orgId = url.searchParams.get('orgId') || 'org_acme_corp';
    const memberId = url.searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    let actor = { id: 'usr_admin_01', name: 'Admin User', email: 'admin@acme.com' };
    try {
      const auth = await requireAuthUser(req);
      actor = { id: auth.user.id, name: auth.user.name, email: auth.user.email };
    } catch {
      // Demo fallback
    }

    const db = getServerDb();
    const success = await db.removeMembership(orgId, memberId, actor);

    return NextResponse.json({ success });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error removing member';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
