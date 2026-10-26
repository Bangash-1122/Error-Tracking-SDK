import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';

export const projectKeys = pgTable('project_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull().default('Default Ingest Key'),
  publicKey: text('public_key').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  status: text('status').notNull().default('active'), // active, revoked
  rotatedAt: timestamp('rotated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ProjectKey = typeof projectKeys.$inferSelect;
export type NewProjectKey = typeof projectKeys.$inferInsert;
