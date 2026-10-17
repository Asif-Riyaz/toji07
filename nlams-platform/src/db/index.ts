import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use DATABASE_URL from environment variables for production
const connectionString = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/nlams_db';
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
