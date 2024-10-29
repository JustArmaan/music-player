import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
console.log("SQL instance:", sql);
export * from "drizzle-orm";
