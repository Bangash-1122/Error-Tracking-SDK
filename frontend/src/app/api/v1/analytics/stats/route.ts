import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { getServerCache } from '@/lib/server/cache';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const projectId = url.searchParams.get('projectId') || 'prj_prod_01';
    const timeRange = url.searchParams.get('timeRange') || '24h';
    const environment = url.searchParams.get('environment') || 'all';

    const cache = getServerCache();
    const cacheKey = cache.buildKey({
      projectId,
      resource: 'analytics_stats',
      subKey: `${timeRange}_${environment}`,
    });

    const stats = await cache.wrap(
      cacheKey,
      async () => {
        const db = getServerDb();
        return db.getMonitoringStats(projectId, timeRange, environment);
      },
      {
        ttlSeconds: 30, // 30s TTL for real-time dashboard responsiveness
        tags: [`proj:${projectId}`, 'resource:stats'],
      }
    );

    return NextResponse.json(stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error calculating analytics stats';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
