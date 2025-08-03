import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// PM Machine data table
export const pmMachines = pgTable("pm_machines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  no: integer("no").notNull(),
  idMsn: varchar("id_msn").notNull().unique(),
  alamat: text("alamat").notNull(),
  pengelola: text("pengelola").notNull(),
  periodePM: varchar("periode_pm"),
  tglSelesaiPM: varchar("tgl_selesai_pm"),
  status: varchar("status").notNull().default("Outstanding"),
  teknisi: text("teknisi").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notes table for machines
export const machineNotes = pgTable("machine_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  idMsn: varchar("id_msn").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPmMachineSchema = createInsertSchema(pmMachines).omit({
  id: true,
  no: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMachineNoteSchema = createInsertSchema(machineNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPmMachine = z.infer<typeof insertPmMachineSchema>;
export type PmMachine = typeof pmMachines.$inferSelect;
export type InsertMachineNote = z.infer<typeof insertMachineNoteSchema>;
export type MachineNote = typeof machineNotes.$inferSelect;
