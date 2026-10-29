import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get('orgId') || 'org_acme_corp';
    const db = getServerDb();
    const notifications = db.listNotifications(orgId);
    return NextResponse.json({ notifications });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching notifications';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, organizationId = 'org_acme_corp' } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const db = getServerDb();
    const marked = db.markNotificationAsRead(organizationId, id);

    return NextResponse.json({ success: marked });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
