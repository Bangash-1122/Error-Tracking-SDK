import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { z } from 'zod';

const CreateAlertRuleSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(2, 'Rule name is required'),
  condition: z.object({
    type: z.enum(['new_issue', 'frequency_spike', 'regression']),
    threshold: z.number().int().optional(),
    windowSeconds: z.number().int().optional(),
  }),
  destination: z.string().url('Destination must be a valid webhook URL'),
  cooldownMinutes: z.number().int().min(1).default(15),
});

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId') || 'prj_prod_01';
    const db = getServerDb();
    const rules = await db.listAlertRules(projectId);
    const deliveries = await db.listDeliveries(projectId);
    return NextResponse.json({ rules, deliveries });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching alerts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateAlertRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid alert rule configuration' },
        { status: 400 }
      );
    }

    const db = getServerDb();
    const rule = await db.createAlertRule({
      ...parsed.data,
      status: 'active',
    });

    return NextResponse.json({ success: true, rule });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating alert rule' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Alert rule ID is required' }, { status: 400 });
    }

    const db = getServerDb();
    const rule = await db.toggleAlertRule(id);
    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, rule });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error toggling rule' }, { status: 500 });
  }
}
