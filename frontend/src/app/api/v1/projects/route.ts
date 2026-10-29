import { NextRequest, NextResponse } from 'next/server';
import { getServerDb, ProjectRecord } from '@/lib/server/db';
import { requireAuthUser } from '@/lib/server/auth';
import { getServerCache } from '@/lib/server/cache';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  platform: z.enum(['react', 'javascript', 'node', 'python', 'go', 'browser']).default('javascript'),
});

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuthUser(req);
    const db = getServerDb();
    const cache = getServerCache();
    const orgId = req.nextUrl.searchParams.get('orgId') || req.nextUrl.searchParams.get('organizationId');

    let targetOrgId = orgId;
    if (!targetOrgId) {
      const orgs = await db.listUserOrganizations(user.id);
      targetOrgId = orgs.length > 0 ? orgs[0].id : 'org_acme_corp';
    }

    const cacheKey = cache.buildKey({
      orgId: targetOrgId,
      resource: 'project_list',
    });

    const projects = await cache.wrap<ProjectRecord[]>(
      cacheKey,
      async () => db.listProjectsByOrg(targetOrgId!),
      {
        ttlSeconds: 300, // 5m TTL for project metadata
        tags: [`org:${targetOrgId}`, 'resource:projects'],
      }
    );

    return NextResponse.json({ projects });
  } catch {
    // If not authenticated, return demo projects from cache
    const db = getServerDb();
    const cache = getServerCache();
    const cacheKey = cache.buildKey({ orgId: 'org_acme_corp', resource: 'project_list' });
    const projects = await cache.wrap<ProjectRecord[]>(
      cacheKey,
      async () => db.listProjectsByOrg('org_acme_corp'),
      { ttlSeconds: 300, tags: ['org:org_acme_corp', 'resource:projects'] }
    );
    return NextResponse.json({ projects });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuthUser(req);
    const body: unknown = await req.json();
    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid project data' },
        { status: 400 }
      );
    }

    const { organizationId, name, platform } = parsed.data;
    const db = getServerDb();
    const { project, key } = await db.createProject(organizationId, name, platform);

    // Invalidate organization projects cache
    const cache = getServerCache();
    cache.invalidateOrg(organizationId);

    db.recordAuditLog({
      organizationId,
      actor: { id: user.id, name: user.name, email: user.email },
      action: 'project.create',
      resource: 'project',
      targetId: project.id,
      newValue: name,
      result: 'success',
    });

    return NextResponse.json({ project, key });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create project';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
