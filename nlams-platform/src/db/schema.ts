import { pgTable, serial, text, decimal, integer, timestamp } from 'drizzle-orm/pg-core';

export const parcels = pgTable("parcels", {
  id: serial("id").primaryKey(),
  cadastral_id: text("cadastral_id").unique().notNull(),
  owner_name: text("owner_name").notNull(),
  // PostGIS geometry type: Using text as placeholder;
  // in production, change to `geometry` type from 'drizzle-orm/pg-core'
  // or a custom type if geometry columns aren't directly supported.
  geometry: text("geometry").notNull(),
  status: text("status").default('pending'),
});

export const acquisitions = pgTable("acquisitions", {
  id: serial("id").primaryKey(),
  parcel_id: integer("parcel_id").references(() => parcels.id),
  compensation_amount: decimal("compensation_amount", { precision: 12, scale: 2 }),
  phase: text("phase").default('survey'),
});

export const grievances = pgTable("grievances", {
  id: serial("id").primaryKey(),
  parcel_id: integer("parcel_id").references(() => parcels.id),
  submitter_name: text("submitter_name").notNull(),
  description: text("description").notNull(),
  status: text("status").default('open'),
  created_at: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  role: text("role").default('citizen'), // 'admin', 'surveyor', 'legal', 'citizen'
});
