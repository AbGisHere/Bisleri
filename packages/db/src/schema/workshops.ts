import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, unique } from "drizzle-orm/pg-core";

export const workshop = pgTable("workshop", {
  id: text("id").primaryKey(),
  ngoId: text("ngo_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  skillArea: text("skill_area").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  location: text("location").notNull(),
  maxAttendees: integer("max_attendees").notNull().default(20),
  status: text("status").notNull().default("upcoming"), // "upcoming"|"completed"|"cancelled"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enrollment = pgTable(
  "enrollment",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    workshopId: text("workshop_id")
      .notNull()
      .references(() => workshop.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("enroll_user_workshop_unique").on(table.userId, table.workshopId),
  ],
);

import { user } from "./auth";

export const workshopRelations = relations(workshop, ({ one, many }) => ({
  ngo: one(user, { fields: [workshop.ngoId], references: [user.id] }),
  enrollments: many(enrollment),
}));

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
  user: one(user, { fields: [enrollment.userId], references: [user.id] }),
  workshop: one(workshop, { fields: [enrollment.workshopId], references: [workshop.id] }),
}));
