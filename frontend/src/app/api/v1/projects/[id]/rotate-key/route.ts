import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { requireAuthUser } from '@/lib/server/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const db = getServerDb();
    const project = await db.getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let actor = { id: 'usr_admin_01', name: 'Admin User', email: 'admin@acme.com' };
    try {
      const auth = await requireAuthUser(req);
      actor = { id: auth.user.id, name: auth.user.name, email: auth.user.email };
    } catch {
      // Allow demo key rotation
    }

    const { key, rawKey } = await db.rotateProjectKey(projectId);

    db.recordAuditLog({
      organizationId: project.organizationId,
      actor,
      action: 'key.rotate',
      resource: 'project_key',
      targetId: key.id,
      newValue: key.publicKey,
      result: 'success',
    });

    return NextResponse.json({
      success: true,
      key,
      rawKey,
      publicKey: key.publicKey,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Key rotation failed' }, { status: 500 });
  }
}
