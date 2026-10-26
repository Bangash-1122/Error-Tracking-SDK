import { z } from 'zod';

export const IssueStatusEnum = z.enum(['unresolved', 'resolved', 'ignored']);
export type IssueStatus = z.infer<typeof IssueStatusEnum>;

export const IssueQuerySchema = z.object({
  projectId: z.string().optional(),
  status: IssueStatusEnum.optional(),
  environment: z.string().optional(),
  query: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().optional(), // Base64 encoded cursor: { lastSeen, id }
});

export type IssueQuery = z.infer<typeof IssueQuerySchema>;

export const PatchIssueSchema = z.object({
  status: IssueStatusEnum.optional(),
  assignedTo: z.string().uuid().nullable().optional(),
});

export type PatchIssuePayload = z.infer<typeof PatchIssueSchema>;

export const IssueDtoSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  fingerprint: z.string(),
  title: z.string(),
  culprit: z.string(),
  type: z.string(),
  status: IssueStatusEnum,
  count: z.number().int(),
  firstSeen: z.string(),
  lastSeen: z.string(),
  assignedTo: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type IssueDto = z.infer<typeof IssueDtoSchema>;

export const IssueEventQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().optional(),
});

export type IssueEventQuery = z.infer<typeof IssueEventQuerySchema>;
