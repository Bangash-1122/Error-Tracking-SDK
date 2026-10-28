import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const projectId = url.searchParams.get('projectId') || 'prj_prod_01';
    const timeRange = url.searchParams.get('timeRange') || '24h';
    const environment = url.searchParams.get('environment') || 'all';

    const db = getServerDb();
    const stats = await db.getMonitoringStats(projectId, timeRange, environment);

    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error calculating analytics stats' }, { status: 500 });
  }
}
