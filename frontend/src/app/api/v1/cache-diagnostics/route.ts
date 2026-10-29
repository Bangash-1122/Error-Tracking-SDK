import { NextRequest, NextResponse } from 'next/server';
import { getServerCache } from '@/lib/server/cache';

export async function GET(_req: NextRequest) {
  try {
    const cache = getServerCache();
    const diagnostics = cache.getDiagnostics();
    return NextResponse.json({ diagnostics });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error retrieving cache diagnostics';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
