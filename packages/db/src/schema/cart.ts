import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, index, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { product } from "./products";

export const cart = pgTable(
  "cart",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("cart_userId_idx").on(table.userId),
    unique("cart_user_product_unique").on(table.userId, table.productId),
  ],
);

export const cartRelations = relations(cart, ({ one }) => ({
  user: one(user, { fields: [cart.userId], references: [user.id] }),
  product: one(product, { fields: [cart.productId], references: [product.id] }),
}));
