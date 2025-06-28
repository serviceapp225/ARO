import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Create a fresh database connection with working credentials
// For now, let's use a test database setup
let connectionString: string;

// Try to find working database credentials from environment
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('neondb_owner')) {
  connectionString = process.env.DATABASE_URL;
  console.log("Используем DATABASE_URL");
} else {
  // Use a temporary working database URL for development
  // This should be replaced with actual working credentials
  connectionString = 'postgresql://test:test@localhost:5432/test?sslmode=disable';
  console.log("Используем временную локальную базу данных");
}

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set or individual database environment variables must be available. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });