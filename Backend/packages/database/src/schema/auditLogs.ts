import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actor: text('actor').notNull(),
  tenant: text('tenant').notNull(), // organizationId
  action: text('action').notNull(),
  target: text('target').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
