import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const message = pgTable(
  "message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("message_sender_receiver_idx").on(table.senderId, table.receiverId),
    index("message_receiver_idx").on(table.receiverId),
    index("message_receiver_read_idx").on(table.receiverId, table.read),
  ],
);

export const messageRelations = relations(message, ({ one }) => ({
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
    relationName: "sentMessages",
  }),
  receiver: one(user, {
    fields: [message.receiverId],
    references: [user.id],
    relationName: "receivedMessages",
  }),
}));
