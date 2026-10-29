import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { getServerCache } from '@/lib/server/cache';
import { requireAuthUser } from '@/lib/server/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = getServerDb();
    const project = await db.getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching project';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { user } = await requireAuthUser(req);
    const db = getServerDb();

    const success = await db.deleteProject(id, {
      id: user.id,
      name: user.name,
      email: user.email,
    });

    if (!success) {
      return NextResponse.json({ error: 'Project not found or already deleted' }, { status: 404 });
    }

    const cache = getServerCache();
    cache.invalidateProject(id);

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete project';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
