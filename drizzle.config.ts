import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// This is a configuration file for Drizzle Kit, which is used to generate SQL migrations based on your schema definitions in Drizzle ORM.
export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});