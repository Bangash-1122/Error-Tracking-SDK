import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
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
    const releases = await db.listReleases(projectId);
    return NextResponse.json({ releases });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching releases' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    return NextResponse.json({ success: true, release });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating release' }, { status: 500 });
  }
}
