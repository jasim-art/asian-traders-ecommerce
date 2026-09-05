import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Reuse the pool across hot-reloads in dev so we don't exhaust connections.
declare global {
  // eslint-disable-next-line no-var
  var __atPgPool: Pool | undefined;
}

const pool =
  global.__atPgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.__atPgPool = pool;
}

export const db = drizzle(pool, { schema });
export * as schema from "./schema";
