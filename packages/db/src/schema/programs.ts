import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const program = pgTable("program", {
  id: text("id").primaryKey(),
  ngoId: text("ngo_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  skills: text("skills").notNull(), // comma-separated
  durationWeeks: integer("duration_weeks"),
  status: text("status").notNull().default("active"), // "active"|"upcoming"|"completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

import { user } from "./auth";

export const programRelations = relations(program, ({ one }) => ({
  ngo: one(user, { fields: [program.ngoId], references: [user.id] }),
}));
