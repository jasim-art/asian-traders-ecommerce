# Asian Traders — E-commerce Website

A full-stack e-commerce site for Asian Traders, Manalmedu (hardware & building
materials), built with Next.js 14, TypeScript, Tailwind CSS, and PostgreSQL.

## ⚠️ Read this first — about the database

You asked me to inspect your **existing** local PostgreSQL database and adapt
the app to it. I could not do that: the environment I built this in has no
network access to your machine, so there was no real `asian_traders` database
for me to connect to and introspect.

What I actually did instead:

1. Installed PostgreSQL locally in my own build sandbox and created a fresh
   `asian_traders` database there.
2. Designed a schema (see `src/db/schema.ts`) modeled on the table names you
   gave me — `products`, `categories`, `brands`, `customers`, `orders`,
   `order_items`, `inventory` — plus a few supporting tables the storefront
   needs (`addresses`, `reviews`, `coupons`).
3. Ran that schema against the real local Postgres, seeded it with realistic
   hardware-store data, and tested every flow (catalog, cart, checkout,
   stock-locking, auth, admin) against that live database. Everything in this
   README you can verify actually works — it isn't a mockup.

**This schema is my best guess at your real tables, not an introspection of
them.** Before you point this app at your actual `asian_traders` database:

```bash
# 1. Put your real connection string in .env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/asian_traders

# 2. Pull your REAL schema into a throwaway file to compare
npx drizzle-kit introspect

# 3. Diff drizzle/schema.ts (generated) against src/db/schema.ts (mine).
#    Rename columns / drop or add tables in src/db/schema.ts to match reality.

# 4. Push only the additive changes (Drizzle's push never drops existing
#    tables or data unless you explicitly confirm a destructive change)
npm run db:push
```

If your real tables use different column names than I guessed, the fastest
path is: keep your table/column names, update the `pgTable(...)` calls in
`src/db/schema.ts` to match them (the `@map`-equivalent in Drizzle is just
passing the real column name as the first string argument to each column
builder), then update the few query files that reference them
(`src/lib/queries.ts`, `src/lib/admin-queries.ts`, the API routes under
`src/app/api/`).

### Why Drizzle instead of Prisma?

You asked for Prisma or another reliable ORM. I started with Prisma, but its
CLI needs to download engine binaries from `binaries.prisma.sh` at
`migrate`/`generate` time, and that host wasn't reachable from my sandbox —
so I literally could not run Prisma at all in this environment. Drizzle ORM
is pure TypeScript/JS with no native binaries, so I could actually install
it, push a schema to a real database, and test real queries. On your own
machine, Prisma would likely work fine (your network isn't sandboxed like
mine) — but since I could only verify what I could actually run, I built and
tested everything on Drizzle. Migrating back to Prisma later is possible; the
schema shapes are equivalent.

---

## Getting started

```bash
npm install
cp .env.example .env   # then edit DATABASE_URL etc.
npm run db:push        # creates tables in your database (non-destructive)
npm run db:seed        # populates sample categories/brands/products/coupons
npm run dev            # http://localhost:3000
```

### Test accounts (created by the seed script)

| Role     | Email                        | Password    |
|----------|-------------------------------|-------------|
| Admin    | admin@asiantraders.test       | Admin@123   |
| Customer | demo@asiantraders.test        | Demo@1234   |

Admin dashboard: `/admin`. Customer account: `/account`.

### Environment variables (`.env`)

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/asian_traders
JWT_SECRET=replace-with-a-long-random-string-in-production
NEXT_PUBLIC_WHATSAPP_NUMBER=919442425301
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never commit `.env` — it's already in `.gitignore`.

---

## What's implemented

**Storefront**
- Homepage matching your existing brand (hero, categories, featured products,
  best sellers, brands, why-choose-us, contact/map) — all sections pull real
  data from Postgres, nothing is hardcoded.
- Shop page: search, category/brand filters, sorting, pagination-ready.
- Product detail: image gallery, specs table, related products, reviews,
  WhatsApp enquiry link, stock-aware Add to Cart / Buy Now.
- Cart: persisted client-side (localStorage), quantity controls, coupon
  validation against the real `coupons` table, live delivery-charge
  calculation.
- Checkout: guest or signed-in, delivery vs. pickup, COD/UPI/Razorpay method
  selection (Razorpay integration itself is stubbed — see below), and a
  **transactional** order-placement API that locks stock rows
  (`SELECT ... FOR UPDATE OF products`), validates every line item against
  live inventory, and rejects the whole order if anything would oversell.
- Order confirmation page + customer order history + order detail with a
  status tracker.

**Admin** (`/admin`, gated by `role = 'admin'` on the `customers` table)
- Dashboard: total sales, orders, pending orders, customers, products,
  low-stock alerts, and a 14-day sales bar chart — all computed live from
  Postgres.
- Products: list, create, edit, deactivate (soft delete — never destroys
  order history).
- Orders: list with status filter, detail view, status updates (cancelling
  an order automatically restocks its items).
- Categories, brands, customers, coupons: basic list + create views.

**Cross-cutting**
- JWT session in an httpOnly cookie, bcrypt password hashing.
- SEO: per-page metadata, Open Graph tags, JSON-LD for `HardwareStore` and
  `Product`, `sitemap.xml`, `robots.txt`.
- Fonts are self-hosted via `@fontsource` (Barlow Condensed / Inter /
  JetBrains Mono) rather than fetched from Google Fonts at build/runtime —
  more reliable in restricted network environments and slightly better for
  performance in production too.

## What's stubbed / left for you

- **Razorpay**: the payment-method option exists end-to-end in the UI and
  order schema, but there's no live Razorpay order-creation/signature-
  verification call wired in. That needs your Razorpay API keys and a
  webhook endpoint — happy to wire it up once you have a test account.
- **Image uploads**: the admin product form takes image URLs (comma-
  separated) rather than a file-upload widget. Wiring real uploads needs an
  object-storage bucket (S3/Cloudflare R2/etc.) — tell me which you'd
  prefer and I'll add it.
- **Reviews submission**: reviews display on product pages, but there's no
  "leave a review" form yet — only seeded/admin-inserted reviews show.

## Scripts

```bash
npm run dev            # start dev server
npm run build           # production build
npm run start            # run the production build
npm run db:push          # push schema.ts to the database (additive)
npm run db:introspect     # pull the ACTUAL schema from your database
npm run db:seed            # populate sample data
npm run db:studio           # visual DB browser (Drizzle Studio)
```
