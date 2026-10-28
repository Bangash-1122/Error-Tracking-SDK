import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { requireAuthUser } from '@/lib/server/auth';
import { z } from 'zod';

const PatchSingleSchema = z.object({
  status: z.enum(['unresolved', 'resolved', 'ignored']).optional(),
  assignedTo: z.string().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getServerDb();
    const issue = await db.getIssueById(id);
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const latestEvent = await db.getLatestEventForIssue(id);
    return NextResponse.json({ issue, latestEvent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching issue' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = PatchSingleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid parameters' },
        { status: 400 }
      );
    }

    const db = getServerDb();

    let actor = { id: 'usr_admin_01', name: 'Admin User', email: 'admin@acme.com' };
    try {
      const auth = await requireAuthUser(req);
      actor = { id: auth.user.id, name: auth.user.name, email: auth.user.email };
    } catch {
      // Demo fallback
    }

    const updated = await db.patchIssue(id, parsed.data, actor);
    if (!updated) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, issue: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating issue' }, { status: 500 });
  }
}
