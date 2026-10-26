import { z } from 'zod';

export const CreateOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric and dashes only').min(2),
});

export type CreateOrganizationPayload = z.infer<typeof CreateOrganizationSchema>;

export const CreateProjectSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(2),
  platform: z.enum(['javascript', 'react', 'node', 'python', 'go', 'browser']).default('javascript'),
});

export type CreateProjectPayload = z.infer<typeof CreateProjectSchema>;

export const IssueKeySchema = z.object({
  name: z.string().default('Default ingest key'),
  allowedOrigins: z.array(z.string()).optional(),
});

export type IssueKeyPayload = z.infer<typeof IssueKeySchema>;

export const RegisterReleaseSchema = z.object({
  projectId: z.string().uuid(),
  version: z.string().min(1),
  ref: z.string().optional(), // Git commit SHA or tag
  metadata: z.record(z.unknown()).optional(),
});

export type RegisterReleasePayload = z.infer<typeof RegisterReleaseSchema>;

export const CreateAlertRuleSchema = z.object({
  projectId: z.string().uuid(),
  condition: z.object({
    type: z.enum(['new_issue', 'frequency_spike', 'regression']),
    threshold: z.number().int().optional(),
    windowSeconds: z.number().int().optional(),
  }),
  destination: z.string().url('Destination must be a valid webhook URL'),
  cooldownMinutes: z.number().int().min(1).default(15),
});

export type CreateAlertRulePayload = z.infer<typeof CreateAlertRuleSchema>;

export const CreateCheckoutSchema = z.object({
  organizationId: z.string().uuid(),
  plan: z.enum(['pro', 'enterprise']),
  returnUrl: z.string().url(),
});

export type CreateCheckoutPayload = z.infer<typeof CreateCheckoutSchema>;
