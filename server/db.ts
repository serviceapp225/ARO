import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Always build DATABASE_URL from individual environment variables for fresh connection
let connectionString: string;

if (process.env.PGUSER && process.env.PGPASSWORD && process.env.PGHOST && process.env.PGPORT && process.env.PGDATABASE) {
  connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=require`;
  console.log("Использую новые учетные данные базы данных");
} else {
  connectionString = process.env.DATABASE_URL || '';
  console.log("Использую DATABASE_URL из переменной окружения");
}

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set or individual database environment variables must be available. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });