import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { env } from "../env.js";
import * as schema from "./schema.js";

type Database = NeonHttpDatabase<typeof schema>;

let dbInstance: Database | null = null;

export function getDb(): Database {
  if (dbInstance) {
    return dbInstance;
  }

  if (!env.databaseUrl) {
    throw new Error(
      "DATABASE_URL is missing. Copy Server/.env.example to Server/.env and add your Neon connection string.",
    );
  }

  dbInstance = drizzle(neon(env.databaseUrl), { schema });
  return dbInstance;
}
