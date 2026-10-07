import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

/**
 * Neon serverless SQL driver.
 * Usage: const rows = await sql`SELECT * FROM core.transactions LIMIT 5`;
 * Or with parameters: const rows = await sql`SELECT * FROM x WHERE y = ${value}`;
 */
export const sql = neon(process.env.DATABASE_URL);
