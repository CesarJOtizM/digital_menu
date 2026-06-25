import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 + Supabase wiring:
// - The Prisma CLI (migrate/db push/db pull) reads `datasource.url`. With a
//   PgBouncer-pooled DATABASE_URL the Schema Engine breaks ("prepared statement
//   already exists"), so migrations MUST use the DIRECT connection (port 5432).
// - The runtime client keeps the pooled DATABASE_URL via the @prisma/adapter-pg
//   driver adapter (src/shared/infrastructure/prisma/client.ts). PgBouncer stays
//   in the runtime path; the CLI always uses the direct connection.
export default defineConfig({
  schema: "src/prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
