import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { requireAuthUser } from '@/lib/server/auth';
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
    const orgId = req.nextUrl.searchParams.get('orgId') || req.nextUrl.searchParams.get('organizationId');

    let projects: any[] = [];
    if (orgId) {
      projects = await db.listProjectsByOrg(orgId);
    } else {
      const orgs = await db.listUserOrganizations(user.id);
      if (orgs.length > 0) {
        projects = await db.listProjectsByOrg(orgs[0].id);
      }
    }

    return NextResponse.json({ projects });
  } catch {
    // If not authenticated, return demo projects
    const db = getServerDb();
    const projects = await db.listProjectsByOrg('org_acme_corp');
    return NextResponse.json({ projects });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuthUser(req);
    const body = await req.json();
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create project' }, { status: 500 });
  }
}
