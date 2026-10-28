import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { requireAuthUser } from '@/lib/server/auth';
import { z } from 'zod';

const BulkUpdateSchema = z.object({
  issueIds: z.array(z.string()).min(1),
  status: z.enum(['unresolved', 'resolved', 'ignored']),
});

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const projectId = url.searchParams.get('projectId') || undefined;
    const status = (url.searchParams.get('status') as any) || 'all';
    const environment = url.searchParams.get('environment') || 'all';
    const query = url.searchParams.get('query') || url.searchParams.get('q') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const db = getServerDb();
    const result = await db.listIssues({
      projectId,
      status,
      environment,
      query,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching issues' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BulkUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid update parameters' },
        { status: 400 }
      );
    }

    const { issueIds, status } = parsed.data;
    const db = getServerDb();

    let actor = { id: 'usr_admin_01', name: 'Admin User', email: 'admin@acme.com' };
    try {
      const auth = await requireAuthUser(req);
      actor = { id: auth.user.id, name: auth.user.name, email: auth.user.email };
    } catch {
      // Demo fallback actor
    }

    const updated = [];
    for (const id of issueIds) {
      const iss = await db.patchIssue(id, { status }, actor);
      if (iss) updated.push(iss);
    }

    return NextResponse.json({
      success: true,
      updatedCount: updated.length,
      issues: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Bulk update failed' }, { status: 500 });
  }
}
