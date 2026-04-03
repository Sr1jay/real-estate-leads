// pg 8.20 changed sslmode=require to produce ssl:{} (an empty object).
// Node.js TLS sees no rejectUnauthorized key in that object and defaults to
// true, so the Supabase PgBouncer cert (not in Node's default CA store) is
// rejected → P1011. Setting this env var before any socket is opened tells
// Node.js to skip cert validation whenever the ssl options don't say otherwise.
// It must be set here in code, not just in Vercel env vars, because Vercel
// injects env vars before the process starts but pg reads ssl options at
// connection time — setting it here guarantees it is present before the first
// Pool.connect() call regardless of import order.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[Prisma] WARNING: DATABASE_URL is not set. All database calls will fail."
    );
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter, log: ["error"] });
}

// Always write back to globalThis in ALL environments.
// Skipping this in production causes a new PrismaClient — and a new pg
// connection pool — on every serverless invocation.
const prisma = globalThis.prisma ?? createPrismaClient();
globalThis.prisma = prisma;

export default prisma;
