import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get('orgId') || 'org_acme_corp';
    const actorId = req.nextUrl.searchParams.get('actorId') || undefined;
    const action = req.nextUrl.searchParams.get('action') || undefined;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10);

    const db = getServerDb();
    const logs = db.listAuditLogs(orgId, { actorId, action, limit });

    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching audit logs' }, { status: 500 });
  }
}
