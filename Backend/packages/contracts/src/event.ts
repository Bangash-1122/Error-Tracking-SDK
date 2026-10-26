import { z } from 'zod';

export const StackFrameSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  function: z.string().default('?'),
  lineno: z.number().int().optional(),
  colno: z.number().int().optional(),
  in_app: z.boolean().default(true),
  context_line: z.string().optional(),
  pre_context: z.array(z.string()).optional(),
  post_context: z.array(z.string()).optional(),
});

export type StackFrame = z.infer<typeof StackFrameSchema>;

export const ExceptionInfoSchema = z.object({
  type: z.string().min(1, 'Exception type is required'),
  value: z.string().default('An unknown error occurred'),
  mechanism: z.object({
    handled: z.boolean().default(false),
    type: z.string().optional(),
  }).optional(),
});

export type ExceptionInfo = z.infer<typeof ExceptionInfoSchema>;

export const BreadcrumbSchema = z.object({
  timestamp: z.string().datetime({ offset: true }).or(z.number()),
  category: z.string().default('default'),
  message: z.string().optional(),
  level: z.enum(['debug', 'info', 'warning', 'error', 'critical']).default('info'),
  data: z.record(z.unknown()).optional(),
});

export type Breadcrumb = z.infer<typeof BreadcrumbSchema>;

export const SanitizedContextSchema = z.object({
  user: z.object({
    id: z.string().optional(),
    username: z.string().optional(),
    email: z.string().optional(),
    ip_address: z.string().optional(),
  }).optional(),
  tags: z.record(z.string()).optional(),
  extra: z.record(z.unknown()).optional(),
  request: z.object({
    url: z.string().optional(),
    method: z.string().optional(),
    headers: z.record(z.string()).optional(),
  }).optional(),
  breadcrumbs: z.array(BreadcrumbSchema).optional(),
});

export type SanitizedContext = z.infer<typeof SanitizedContextSchema>;

export const IngestEventPayloadSchema = z.object({
  schemaVersion: z.string().regex(/^1\.\d+\.\d+$/, 'Invalid schema version (expected 1.x.x)'),
  eventId: z.string().uuid('eventId must be a valid UUID'),
  projectKey: z.string().min(10, 'projectKey is required and must be valid'),
  occurredAt: z.string().datetime({ offset: true, message: 'occurredAt must be a valid ISO 8601 string' }),
  release: z.string().optional(),
  environment: z.string().min(1).default('production'),
  exception: ExceptionInfoSchema,
  frames: z.array(StackFrameSchema).default([]),
  context: SanitizedContextSchema.default({}),
});

export type IngestEventPayload = z.infer<typeof IngestEventPayloadSchema>;

export const IngestAcceptedResponseSchema = z.object({
  status: z.literal('accepted'),
  eventId: z.string(),
  requestId: z.string(),
  receivedAt: z.string(),
});

export type IngestAcceptedResponse = z.infer<typeof IngestAcceptedResponseSchema>;
