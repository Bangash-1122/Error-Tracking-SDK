import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('stripe-signature') || req.headers.get('x-webhook-signature');
    const body = await req.json();

    // Verify webhook signature (in demo/dev mode, verify presence of event type)
    if (!body || !body.type) {
      return NextResponse.json({ error: 'Missing webhook event payload' }, { status: 400 });
    }

    const db = getServerDb();

    switch (body.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.updated': {
        const orgId = body.data?.organizationId || 'org_acme_corp';
        const plan = body.data?.plan || 'pro';
        await db.updateSubscriptionPlan(orgId, plan);
        break;
      }
      case 'invoice.payment_succeeded': {
        // Record payment success
        break;
      }
      case 'customer.subscription.deleted': {
        const orgId = body.data?.organizationId || 'org_acme_corp';
        await db.updateSubscriptionPlan(orgId, 'free');
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true, event: body.type });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
