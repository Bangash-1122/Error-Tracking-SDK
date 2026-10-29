import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { z } from 'zod';

const CheckoutSchema = z.object({
  organizationId: z.string().default('org_acme_corp'),
  plan: z.enum(['pro', 'enterprise']),
  returnUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid checkout payload' },
        { status: 400 }
      );
    }

    const { organizationId, plan, returnUrl } = parsed.data;
    const db = getServerDb();

    // Create session ID
    const sessionId = `cs_test_${crypto.randomUUID().slice(0, 16)}`;
    const checkoutUrl = returnUrl || `/org/acme-corp/billing?session_id=${sessionId}&success=true`;

    // Update subscription plan
    await db.updateSubscriptionPlan(organizationId, plan);

    return NextResponse.json({
      success: true,
      sessionId,
      checkoutUrl,
      message: `Checkout session initialized for ${plan.toUpperCase()} tier`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout initiation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
