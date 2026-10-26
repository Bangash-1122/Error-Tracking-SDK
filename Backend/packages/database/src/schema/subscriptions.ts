import { pgTable, text, integer, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.js';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  plan: text('plan').notNull().default('free'), // free, pro, enterprise
  period: text('period').notNull().default('monthly'), // monthly, yearly
  status: text('status').notNull().default('active'), // active, past_due, canceled
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).defaultNow().notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  eventLimit: integer('event_limit').notNull().default(10000), // free plan default 10k
});

export const usageCounters = pgTable('usage_counters', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  period: text('period').notNull(), // '2026-10'
  acceptedEvents: integer('accepted_events').notNull().default(0),
  billableEvents: integer('billable_events').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('usage_org_period_idx').on(table.organizationId, table.period),
]);

export type Subscription = typeof subscriptions.$inferSelect;
export type UsageCounter = typeof usageCounters.$inferSelect;
