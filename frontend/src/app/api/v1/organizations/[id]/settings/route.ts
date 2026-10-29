import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { getServerCache } from '@/lib/server/cache';
import { requireAuthUser } from '@/lib/server/auth';
import { z } from 'zod';

const UpdateOrgSettingsSchema = z.object({
  orgName: z.string().min(2).optional(),
  billingEmail: z.string().email().optional(),
  complianceTier: z.enum(['standard', 'hipaa', 'gdpr', 'soc2']).optional(),
  defaultDataRetentionDays: z.number().min(30).max(365).optional(),
  enforceMfa: z.boolean().optional(),
  ipAllowlist: z.array(z.string()).optional(),
  defaultRoleForNewMembers: z.enum(['admin', 'developer', 'viewer']).optional(),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = getServerDb();
    const settings = await db.getOrganizationSettings(id);
    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching organization settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { user } = await requireAuthUser(req);
    const body: unknown = await req.json();

    const parsed = UpdateOrgSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid organization settings payload', details: parsed.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }

    const db = getServerDb();
    const settings = await db.updateOrganizationSettings(id, parsed.data, {
      id: user.id,
      name: user.name,
      email: user.email,
    });

    const cache = getServerCache();
    cache.invalidateOrg(id);

    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update organization settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
