import { pgTable, text, timestamp, uuid, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';
import { issues } from './issues.js';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  issueId: uuid('issue_id').references(() => issues.id, { onDelete: 'cascade' }).notNull(),
  eventId: text('event_id').notNull(),
  payload: jsonb('payload').notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('event_project_event_id_idx').on(table.projectId, table.eventId),
  index('event_project_received_at_idx').on(table.projectId, table.receivedAt),
  index('event_issue_received_at_idx').on(table.issueId, table.receivedAt),
]);

export type EventRecord = typeof events.$inferSelect;
export type NewEventRecord = typeof events.$inferInsert;
