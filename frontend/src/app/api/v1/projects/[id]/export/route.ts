import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { requireAuthUser } from '@/lib/server/auth';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await requireAuthUser(req);
    const db = getServerDb();
    const exportData = await db.exportProjectData(id);

    return NextResponse.json({
      config: exportData.settings,
      exportedAt: exportData.exportedAt,
      project: exportData.project,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error exporting project config';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
