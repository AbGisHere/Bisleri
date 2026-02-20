import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  index,
} from "drizzle-orm/pg-core";

export const product = pgTable(
  "product",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    location: text("location").notNull(),
    demandScale: integer("demand_scale"), // 0-100 score
    imageUrl: text("image_url"),
    status: text("status").default("active").notNull(), // active, inactive, sold
    sellerId: text("seller_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("product_sellerId_idx").on(table.sellerId),
    index("product_status_idx").on(table.status),
    index("product_location_idx").on(table.location),
  ],
);

// Import user from auth schema for the relation
import { user } from "./auth";

export const productRelations = relations(product, ({ one }) => ({
  seller: one(user, {
    fields: [product.sellerId],
    references: [user.id],
  }),
}));
