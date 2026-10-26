import { describe, it, expect } from 'vitest';
import {
  IngestEventPayloadSchema,
  BreadcrumbSchema,
  StackFrameSchema,
  ExceptionInfoSchema,
  IssueQuerySchema,
  PatchIssueSchema,
  CreateOrganizationSchema,
  CreateProjectSchema,
  CreateAlertRuleSchema,
  RegisterReleaseSchema,
  ErrorCode,
  ErrorResponseSchema,
} from '../index.js';

describe('Contracts - Event Schemas', () => {
  it('validates a correct IngestEventPayload with UTC timestamp', () => {
    const payload = {
      schemaVersion: '1.0.0',
      eventId: '123e4567-e89b-12d3-a456-426614174000',
      projectKey: 'ek_live_1234567890abcdef12345678',
      occurredAt: '2026-10-26T12:00:00Z',
      environment: 'production',
      exception: {
        type: 'TypeError',
        value: 'Cannot read properties of undefined (reading "map")',
        mechanism: { handled: false },
      },
      frames: [
        {
          filename: 'src/components/List.tsx',
          function: 'renderList',
          lineno: 42,
          colno: 15,
          in_app: true,
        },
      ],
      context: {
        user: { id: 'usr_1', email: 'user@example.com' },
        tags: { browser: 'Chrome' },
      },
    };

    const parsed = IngestEventPayloadSchema.parse(payload);
    expect(parsed.eventId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(parsed.exception.type).toBe('TypeError');
    expect(parsed.frames.length).toBe(1);
  });

  it('validates timestamps with timezone offsets (+05:00 / -04:00)', () => {
    const payload = {
      schemaVersion: '1.0.0',
      eventId: '123e4567-e89b-12d3-a456-426614174000',
      projectKey: 'ek_live_1234567890abcdef12345678',
      occurredAt: '2026-10-26T12:00:00+05:00',
      exception: {
        type: 'Error',
      },
    };

    const parsed = IngestEventPayloadSchema.parse(payload);
    expect(parsed.occurredAt).toBe('2026-10-26T12:00:00+05:00');
  });

  it('rejects invalid UUID eventId', () => {
    const payload = {
      schemaVersion: '1.0.0',
      eventId: 'not-a-uuid',
      projectKey: 'ek_live_1234567890abcdef12345678',
      occurredAt: '2026-10-26T12:00:00Z',
      exception: { type: 'Error' },
    };

    expect(() => IngestEventPayloadSchema.parse(payload)).toThrow();
  });

  it('rejects invalid schema version', () => {
    const payload = {
      schemaVersion: '2.0',
      eventId: '123e4567-e89b-12d3-a456-426614174000',
      projectKey: 'ek_live_1234567890abcdef12345678',
      occurredAt: '2026-10-26T12:00:00Z',
      exception: { type: 'Error' },
    };

    expect(() => IngestEventPayloadSchema.parse(payload)).toThrow();
  });

  it('validates breadcrumbs with both numeric timestamps and ISO strings with offsets', () => {
    const bcNumber = BreadcrumbSchema.parse({
      timestamp: Date.now(),
      category: 'ui.click',
      message: 'User clicked submit button',
      level: 'info',
    });
    expect(typeof bcNumber.timestamp).toBe('number');

    const bcString = BreadcrumbSchema.parse({
      timestamp: '2026-10-26T08:30:00-04:00',
      category: 'xhr',
      level: 'warning',
    });
    expect(typeof bcString.timestamp).toBe('string');
  });
});

describe('Contracts - Issue and Query Schemas', () => {
  it('coerces string limits to numbers and applies defaults', () => {
    const query = IssueQuerySchema.parse({
      projectId: 'proj_123',
      limit: '50',
    });
    expect(query.limit).toBe(50);

    const defaultQuery = IssueQuerySchema.parse({});
    expect(defaultQuery.limit).toBe(25);
  });

  it('validates patch issue payload', () => {
    const patch = PatchIssueSchema.parse({
      status: 'resolved',
      assignedTo: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(patch.status).toBe('resolved');
  });
});

describe('Contracts - Management Schemas', () => {
  it('validates organization creation with slug format enforcement', () => {
    const valid = CreateOrganizationSchema.parse({
      name: 'Acme International',
      slug: 'acme-corp-123',
    });
    expect(valid.slug).toBe('acme-corp-123');

    expect(() =>
      CreateOrganizationSchema.parse({
        name: 'Invalid Org',
        slug: 'Acme Corp with spaces & Caps!',
      })
    ).toThrow();
  });

  it('validates project creation', () => {
    const project = CreateProjectSchema.parse({
      organizationId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Mobile Client',
      platform: 'react',
    });
    expect(project.platform).toBe('react');
  });

  it('validates alert rule creation with condition threshold', () => {
    const rule = CreateAlertRuleSchema.parse({
      projectId: '123e4567-e89b-12d3-a456-426614174000',
      condition: {
        type: 'frequency_spike',
        threshold: 100,
        windowSeconds: 60,
      },
      destination: 'https://example.com/webhook',
      cooldownMinutes: 30,
    });
    expect(rule.condition.type).toBe('frequency_spike');
    expect(rule.cooldownMinutes).toBe(30);
  });

  it('validates error responses with enum codes', () => {
    const res = ErrorResponseSchema.parse({
      error: {
        code: ErrorCode.RATE_LIMITED,
        message: 'Too many requests',
        requestId: 'req_123',
      },
    });
    expect(res.error.code).toBe('RATE_LIMITED');
  });
});
