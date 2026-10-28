import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId') || 'prj_prod_01';
    const db = getServerDb();
    const stats = db.getPerformanceStats(projectId);
    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching performance telemetry' }, { status: 500 });
  }
}
