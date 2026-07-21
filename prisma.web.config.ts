import "dotenv/config";
import type { PrismaConfig } from "prisma/config";
import { env } from "prisma/config";

// Config for the client against the Riksdagen web app's database.
// The web repo owns that schema; this is a mirror.
// Generate with: yarn prisma generate --config prisma.web.config.ts
export default {
  schema: "prisma/web.schema.prisma",
  datasource: {
    url: env("WEB_DATABASE_URL"),
  },
} satisfies PrismaConfig;
