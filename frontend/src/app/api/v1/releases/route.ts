import { NextRequest, NextResponse } from 'next/server';
import { getServerDb, ReleaseRecord } from '@/lib/server/db';
import { getServerCache } from '@/lib/server/cache';
import { z } from 'zod';

const CreateReleaseSchema = z.object({
  projectId: z.string().min(1),
  version: z.string().min(1, 'Version is required'),
  ref: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId') || 'prj_prod_01';
    const db = getServerDb();
    const cache = getServerCache();
    const cacheKey = cache.buildKey({ projectId, resource: 'release_list' });

    const releases = await cache.wrap<ReleaseRecord[]>(
      cacheKey,
      async () => db.listReleases(projectId),
      { ttlSeconds: 300, tags: [`proj:${projectId}`, 'resource:releases'] }
    );

    return NextResponse.json({ releases });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching releases';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = CreateReleaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid parameters' },
        { status: 400 }
      );
    }

    const { projectId, version, ref } = parsed.data;
    const db = getServerDb();
    const release = await db.createRelease(projectId, version, ref);

    // Invalidate project release cache
    const cache = getServerCache();
    cache.invalidateProject(projectId);

    return NextResponse.json({ success: true, release });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating release';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
