import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { product } from "./products";

export const order = pgTable(
  "order",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    sellerId: text("seller_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    // pending | shipped | delivered | returned
    status: text("status").default("pending").notNull(),
    buyerAddress: text("buyer_address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("order_buyerId_idx").on(table.buyerId),
    index("order_sellerId_idx").on(table.sellerId),
    index("order_status_idx").on(table.status),
  ],
);

export const orderRelations = relations(order, ({ one }) => ({
  product: one(product, {
    fields: [order.productId],
    references: [product.id],
  }),
  buyer: one(user, {
    fields: [order.buyerId],
    references: [user.id],
    relationName: "buyer",
  }),
  seller: one(user, {
    fields: [order.sellerId],
    references: [user.id],
    relationName: "seller",
  }),
}));
