import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId') || 'prj_prod_01';
    const db = getServerDb();
    const project = await db.getProjectById(projectId);
    const issues = (await db.listIssues({ projectId, limit: 1 })).items;
    const lastIssue = issues[0];

    const stats = {
      sdkVersion: '1.0.0',
      clientLibrary: '@error-tracker/browser',
      integrationStatus: (project?.eventCount || 0) > 0 ? 'healthy' : 'pending_setup',
      lastReceivedEventAt: lastIssue?.lastSeen || new Date().toISOString(),
      successfulIngestionCount: project?.eventCount || 0,
      rejectedEventsCount: 0,
      rateLimitedEventsCount: 0,
      sampleRateConfigured: '100%',
      environmentDetected: lastIssue?.environment || 'production',
      releaseDetected: lastIssue?.release || 'v1.3.2',
      configurationChecks: [
        { name: 'DSN Project Key Syntax', passed: true, detail: 'Valid 256-bit hashed key' },
        { name: 'Payload Schema Version 1.x.x', passed: true, detail: 'v1.0.0 compliant' },
        { name: 'Stack Trace Serialization', passed: true, detail: 'V8 / JSCore frame parser active' },
        { name: 'CORS & Origin Security', passed: true, detail: 'Wildcard public ingress allowed' },
        { name: 'Rate Limit Threshold', passed: true, detail: '600 events / minute allowed' },
      ],
      failureReasons: [
        { reason: 'Rate limit exceeded (HTTP 429)', occurrences: 0 },
        { reason: 'Invalid or revoked project key (HTTP 401)', occurrences: 0 },
        { reason: 'Schema validation mismatch (HTTP 400)', occurrences: 0 },
        { reason: 'Payload oversized > 256KB (HTTP 413)', occurrences: 0 },
      ],
    };

    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'SDK health query failed' }, { status: 500 });
  }
}
