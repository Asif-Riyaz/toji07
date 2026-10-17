import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { parcels } from './schema';

export const grievances = pgTable("grievances", {
  id: serial("id").primaryKey(),
  parcel_id: integer("parcel_id").references(() => parcels.id),
  submitter_name: text("submitter_name").notNull(),
  description: text("description").notNull(),
  status: text("status").default('open'), // 'open', 'in-review', 'resolved', 'closed'
  created_at: timestamp("created_at").defaultNow(),
});
