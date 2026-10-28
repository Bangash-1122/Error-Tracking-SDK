import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { z } from 'zod';

const UpdateIntegrationSchema = z.object({
  organizationId: z.string().default('org_acme_corp'),
  id: z.string().min(1),
  config: z.record(z.string(), z.string()),
  status: z.enum(['connected', 'disconnected', 'error']),
});

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get('orgId') || 'org_acme_corp';
    const db = getServerDb();
    const integrations = db.listIntegrations(orgId);
    return NextResponse.json({ integrations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching integrations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UpdateIntegrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid parameters' },
        { status: 400 }
      );
    }

    const { organizationId, id, config, status } = parsed.data;
    const db = getServerDb();
    const updated = db.updateIntegration(organizationId, id, config as Record<string, string>, status);

    return NextResponse.json({ success: true, integration: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating integration' }, { status: 500 });
  }
}
