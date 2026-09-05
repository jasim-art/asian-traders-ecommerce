// ============================================================================
// Asian Traders — Drizzle ORM schema
//
// READ THIS BEFORE POINTING AT YOUR REAL DATABASE:
// This was written from the table list you gave me (products, categories,
// brands, customers, orders, order_items, inventory) plus a few supporting
// tables the storefront needs (addresses, reviews, coupons). I could not
// connect to your actual local PostgreSQL server from this build
// environment (it's a sandbox with no network path to your machine), so
// this is a best-guess shape for those tables, not an introspection of
// what's really there.
//
// To reconcile with your real DB:
//   1. Point DATABASE_URL (.env) at your real `asian_traders` database.
//   2. Run `npm run db:introspect` (drizzle-kit introspect) — this generates
//      a schema file FROM your actual tables so you can diff it against
//      this one and see exactly where column names/types differ.
//   3. Adjust the pgTable() calls below to match (rename columns, drop
//      tables you don't need, add ones that already exist in your DB but
//      aren't modeled here yet).
//   4. Run `npm run db:push` to apply any additive changes — Drizzle's
//      push is non-destructive by default for existing data; review the
//      generated SQL before confirming.
//
// All tables use snake_case column names (matching typical existing SQL
// schemas) while the TS/Drizzle API stays camelCase.
// ============================================================================

import {
  pgTable,
  uuid,
  text,
  varchar,
  numeric,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["COD", "UPI", "RAZORPAY"]);

export const deliveryMethodEnum = pgEnum("delivery_method", ["DELIVERY", "PICKUP"]);

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  icon: varchar("icon", { length: 40 }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  specifications: jsonb("specifications").$type<Record<string, string>>(),
  images: text("images").array().notNull().default([]),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  mrp: numeric("mrp", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull().default("pc"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("0"),
  ratingCount: integer("rating_count").notNull().default(0),
  lowStockAt: integer("low_stock_at").notNull().default(5),
  categoryId: uuid("category_id").notNull().references(() => categories.id),
  brandId: uuid("brand_id").references(() => brands.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .unique()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(0),
  reservedQty: integer("reserved_qty").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("customer"), // "customer" | "admin"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Nullable: guest checkouts create an address with no linked customer account.
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 40 }).notNull().default("Home"),
  fullName: text("full_name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: varchar("order_number", { length: 30 }).notNull().unique(),
  customerId: uuid("customer_id").references(() => customers.id),

  guestName: text("guest_name"),
  guestEmail: varchar("guest_email", { length: 255 }),
  guestPhone: varchar("guest_phone", { length: 20 }),

  addressId: uuid("address_id").references(() => addresses.id),

  deliveryMethod: deliveryMethodEnum("delivery_method").notNull().default("DELIVERY"),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("COD"),
  status: orderStatusEnum("status").notNull().default("PENDING"),

  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryCharge: numeric("delivery_charge", { precision: 10, scale: 2 }).notNull().default("0"),
  discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),

  couponCode: varchar("coupon_code", { length: 40 }),
  notes: text("notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
});

// ---------------------------------------------------------------------------
// Reviews & Coupons
// ---------------------------------------------------------------------------

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").references(() => customers.id),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  description: text("description"),
  percentOff: integer("percent_off"),
  flatOff: numeric("flat_off", { precision: 10, scale: 2 }),
  minOrderValue: numeric("min_order_value", { precision: 10, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations (for Drizzle's relational query API)
// ---------------------------------------------------------------------------

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  inventory: one(inventory, { fields: [products.id], references: [inventory.productId] }),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, { fields: [inventory.productId], references: [products.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  customer: one(customers, { fields: [addresses.customerId], references: [customers.id] }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  address: one(addresses, { fields: [orders.addressId], references: [addresses.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  customer: one(customers, { fields: [reviews.customerId], references: [customers.id] }),
}));
