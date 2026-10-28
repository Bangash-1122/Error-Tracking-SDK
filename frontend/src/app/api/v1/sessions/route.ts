import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId') || 'prj_prod_01';
    const db = getServerDb();
    const sessions = db.listSessions(projectId);

    // Group distinct affected users
    const userMap = new Map<string, { userId: string; email: string; sessions: number; errors: number; lastSeen: string }>();
    for (const s of sessions) {
      if (s.userId) {
        const cur = userMap.get(s.userId) || {
          userId: s.userId,
          email: s.userEmail || 'anonymous',
          sessions: 0,
          errors: 0,
          lastSeen: s.lastActiveAt,
        };
        cur.sessions += 1;
        cur.errors += s.errorCount;
        if (new Date(s.lastActiveAt) > new Date(cur.lastSeen)) {
          cur.lastSeen = s.lastActiveAt;
        }
        userMap.set(s.userId, cur);
      }
    }

    return NextResponse.json({
      sessions,
      affectedUsers: Array.from(userMap.values()),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching sessions' }, { status: 500 });
  }
}
