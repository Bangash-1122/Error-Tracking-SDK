import { pgTable, text, integer, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';
import { issues } from './issues.js';

export const alertRules = pgTable('alert_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  condition: jsonb('condition').notNull(),
  destination: text('destination').notNull(),
  status: text('status').notNull().default('active'), // active, paused
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const alertDeliveries = pgTable('alert_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  alertRuleId: uuid('alert_rule_id').references(() => alertRules.id, { onDelete: 'cascade' }).notNull(),
  issueId: uuid('issue_id').references(() => issues.id, { onDelete: 'set null' }),
  condition: text('condition').notNull(),
  destination: text('destination').notNull(),
  attempts: integer('attempts').notNull().default(1),
  status: text('status').notNull().default('pending'), // pending, sent, failed
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
});

export type AlertRule = typeof alertRules.$inferSelect;
export type AlertDelivery = typeof alertDeliveries.$inferSelect;
