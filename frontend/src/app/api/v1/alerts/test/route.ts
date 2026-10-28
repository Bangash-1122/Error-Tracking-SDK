import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { z } from 'zod';

const TestAlertSchema = z.object({
  projectId: z.string().default('prj_prod_01'),
  destination: z.string().url('Destination must be a valid webhook URL'),
  ruleName: z.string().default('Test Alert Notification'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TestAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid parameters' },
        { status: 400 }
      );
    }

    const { projectId, destination, ruleName } = parsed.data;
    const db = getServerDb();

    const testPayload = {
      event: 'alert.test_verification',
      rule: ruleName,
      timestamp: new Date().toISOString(),
      sampleIssue: {
        title: 'TypeError: Cannot read properties of undefined (reading "items")',
        environment: 'production',
        release: 'v1.3.2',
        occurrences: 1420,
        culprit: 'src/components/cart/CartDrawer.tsx:42:15',
      },
    };

    let deliveryStatus: 'sent' | 'failed' = 'sent';
    let errorMessage: string | undefined;

    try {
      const response = await fetch(destination, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (!response.ok) {
        deliveryStatus = 'failed';
        errorMessage = `HTTP error ${response.status} from webhook endpoint`;
      }
    } catch (fetchErr: any) {
      deliveryStatus = 'failed';
      errorMessage = fetchErr.message || 'Connection refused or timed out';
    }

    const delivery = {
      id: `del_${Date.now()}`,
      projectId,
      alertRuleId: 'test_manual',
      condition: 'Manual test dispatch verification',
      destination,
      status: deliveryStatus,
      attempts: 1,
      sentAt: new Date().toISOString(),
      error: errorMessage,
    };

    return NextResponse.json({
      success: deliveryStatus === 'sent',
      delivery,
      message:
        deliveryStatus === 'sent'
          ? `Test payload successfully dispatched to ${destination}`
          : `Delivery failed: ${errorMessage}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error executing test alert' }, { status: 500 });
  }
}
