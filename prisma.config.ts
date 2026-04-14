
import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import path from "path";

// Load .env.local explicitly (Next.js convention)
config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/dummy",
    directUrl: process.env.DIRECT_URL,
  },
});
