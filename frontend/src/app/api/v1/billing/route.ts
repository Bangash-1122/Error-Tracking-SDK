import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { requireAuthUser } from '@/lib/server/auth';
import { z } from 'zod';

const UpdatePlanSchema = z.object({
  organizationId: z.string().default('org_acme_corp'),
  plan: z.enum(['free', 'pro', 'enterprise']),
});

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get('orgId') || 'org_acme_corp';
    const db = getServerDb();
    const subscription = await db.getSubscription(orgId);
    const invoices = await db.listInvoices(orgId);

    return NextResponse.json({
      subscription,
      invoices,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching billing data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UpdatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid plan parameters' },
        { status: 400 }
      );
    }

    const { organizationId, plan } = parsed.data;
    const db = getServerDb();

    let actor = { id: 'usr_admin_01', name: 'Admin User', email: 'admin@acme.com' };
    try {
      const auth = await requireAuthUser(req);
      actor = { id: auth.user.id, name: auth.user.name, email: auth.user.email };
    } catch {
      // Demo fallback
    }

    const updated = await db.updateSubscriptionPlan(organizationId, plan, actor);
    return NextResponse.json({ success: true, subscription: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating plan' }, { status: 500 });
  }
}
