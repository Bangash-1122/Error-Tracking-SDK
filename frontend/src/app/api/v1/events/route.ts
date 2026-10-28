import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerDb } from '@/lib/server/db';

const StackFrameSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  function: z.string().default('?'),
  lineno: z.number().int().optional(),
  colno: z.number().int().optional(),
  in_app: z.boolean().default(true),
  context_line: z.string().optional(),
  pre_context: z.array(z.string()).optional(),
  post_context: z.array(z.string()).optional(),
});

const ExceptionInfoSchema = z.object({
  type: z.string().min(1, 'Exception type is required'),
  value: z.string().default('An unknown error occurred'),
  mechanism: z.object({
    handled: z.boolean().default(false),
    type: z.string().optional(),
  }).optional(),
});

const BreadcrumbSchema = z.object({
  timestamp: z.string().datetime({ offset: true }).or(z.number()).or(z.string()),
  category: z.string().default('default'),
  message: z.string().optional(),
  level: z.enum(['debug', 'info', 'warning', 'error', 'critical']).default('info'),
  data: z.record(z.string(), z.unknown()).optional(),
});

const IngestEventPayloadSchema = z.object({
  schemaVersion: z.string().regex(/^1\.\d+\.\d+$/, 'Invalid schema version (expected 1.x.x)').default('1.0.0'),
  eventId: z.string().uuid('eventId must be a valid UUID'),
  projectKey: z.string().min(8, 'projectKey is required'),
  occurredAt: z.string().datetime({ offset: true }).or(z.string()),
  release: z.string().optional().default('v1.0.0'),
  environment: z.string().min(1).default('production'),
  exception: ExceptionInfoSchema,
  frames: z.array(StackFrameSchema).default([]),
  context: z.object({
    user: z.object({
      id: z.string().optional(),
      username: z.string().optional(),
      email: z.string().optional(),
      ip_address: z.string().optional(),
    }).optional(),
    tags: z.record(z.string(), z.string()).optional(),
    extra: z.record(z.string(), z.unknown()).optional(),
    request: z.object({
      url: z.string().optional(),
      method: z.string().optional(),
      headers: z.record(z.string(), z.string()).optional(),
    }).optional(),
    breadcrumbs: z.array(BreadcrumbSchema).optional(),
  }).default({}),
});

// Sensitive data sanitization regexes
const SENSITIVE_KEY_REGEX = /pass(word)?|secret|token|api[_-]?key|auth|bearer|credit[_-]?card/i;

function sanitizeRecord(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEY_REGEX.test(k)) {
      result[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      result[k] = sanitizeRecord(v);
    } else {
      result[k] = v;
    }
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const rawKey = req.headers.get('x-project-key') || req.nextUrl.searchParams.get('key');
    const body = await req.json();

    const effectiveKey = rawKey || body.projectKey;
    if (!effectiveKey) {
      return NextResponse.json(
        { error: 'Missing Project Ingestion Key in X-Project-Key header or payload.' },
        { status: 401 }
      );
    }

    const db = getServerDb();

    // Authenticate Project Key
    const keyRecord = await db.getProjectKey(effectiveKey);
    if (!keyRecord || !keyRecord.key.isActive) {
      return NextResponse.json(
        { error: 'Invalid or revoked Project Key. Please verify project credentials.' },
        { status: 401 }
      );
    }

    const { project } = keyRecord;

    // Check Plan Quota
    const subscription = await db.getSubscription(project.organizationId);
    if (subscription && subscription.acceptedEvents >= subscription.eventLimit) {
      return NextResponse.json(
        {
          error: `Monthly quota exceeded. Plan allows ${subscription.eventLimit.toLocaleString()} events. Please upgrade your subscription.`,
        },
        { status: 429 }
      );
    }

    // Validate payload with Zod
    const payloadWithKey = { ...body, projectKey: effectiveKey };
    const parsed = IngestEventPayloadSchema.safeParse(payloadWithKey);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Event payload validation failed',
          details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Identify culprit frame
    const inAppFrames = data.frames.filter((f) => f.in_app);
    const topFrame = inAppFrames[inAppFrames.length - 1] || data.frames[data.frames.length - 1];
    const culprit = topFrame ? `${topFrame.filename}:${topFrame.lineno || 0}:${topFrame.colno || 0}` : 'unknown';

    // Sanitize context
    const sanitizedContext = sanitizeRecord(data.context);

    // Ingest transaction
    const result = await db.recordIngestEventTransactional({
      projectId: project.id,
      organizationId: project.organizationId,
      eventId: data.eventId,
      title: `${data.exception.type}: ${data.exception.value}`,
      culprit,
      type: data.exception.type,
      severity: data.exception.type.toLowerCase().includes('critical') || data.exception.type.toLowerCase().includes('fatal')
        ? 'critical'
        : data.exception.type.toLowerCase().includes('warning')
        ? 'warning'
        : 'error',
      release: data.release,
      environment: data.environment,
      frames: data.frames,
      breadcrumbs: sanitizedContext.breadcrumbs || [],
      tags: sanitizedContext.tags || {},
      user: sanitizedContext.user,
      request: sanitizedContext.request,
      occurredAt: data.occurredAt,
    });

    return NextResponse.json(
      {
        status: 'accepted',
        eventId: result.event.eventId,
        requestId: `req_${crypto.randomUUID().slice(0, 8)}`,
        receivedAt: result.event.receivedAt,
        issueId: result.issue.id,
        isNewIssue: result.isNewIssue,
        isRegression: result.isRegression,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal error processing ingestion event' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Project-Key, Authorization',
    },
  });
}
