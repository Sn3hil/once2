import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema"
import { config } from "dotenv";

config({ path: '../../.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool, { schema });
export * from "./schema"
export { eq, desc, asc, inArray, and } from "drizzle-orm";