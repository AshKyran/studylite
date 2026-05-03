// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

// STRICT MODE: Fail fast if the environment variable is missing
if (!process.env.DATABASE_URL) {
  throw new Error("🚨 FATAL: DATABASE_URL environment variable is missing.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: 'npx tsx prisma/seed.ts', 
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});