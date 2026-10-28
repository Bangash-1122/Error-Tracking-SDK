import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || req.nextUrl.searchParams.get('query') || '';
    const orgId = req.nextUrl.searchParams.get('orgId') || 'org_acme_corp';

    const db = getServerDb();
    const results = await db.globalSearch(orgId, q);

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Search execution failed' }, { status: 500 });
  }
}
