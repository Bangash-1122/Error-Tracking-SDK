import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getServerDb();
    const events = await db.getIssueEvents(id);
    return NextResponse.json({ events });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching events';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
