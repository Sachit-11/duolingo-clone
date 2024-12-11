import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";     

const sql = neon(process.env.DATABASE_URL!);
// db is an instance of Drizzle ORM, configured to interact with your Neon PostgreSQL database using the provided schema.
const db = drizzle(sql, { schema });

export default db;