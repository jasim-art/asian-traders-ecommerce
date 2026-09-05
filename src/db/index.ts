import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Use the Neon serverless HTTP driver. This avoids persistent TCP connection
// overhead in serverless / edge environments (Vercel, etc.) where a traditional
// pg.Pool would exhaust connections or time out on cold starts.
//
// DATABASE_URL must be set — failure to set it is a deployment configuration
// error and we want a clear crash rather than silently falling back to localhost.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
      "Add it to .env.local for local development or to your Vercel project settings for production."
  );
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
export * as schema from "./schema";
