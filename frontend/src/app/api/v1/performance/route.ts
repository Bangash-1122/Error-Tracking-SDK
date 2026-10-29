import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId') || 'prj_prod_01';
    const db = getServerDb();
    const stats = db.getPerformanceStats(projectId);
    return NextResponse.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching performance telemetry';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
