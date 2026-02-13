import { PrismaClient } from "../generated/client/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const url = process.env.DATABASE_URL ? process.env.DATABASE_URL : "file:./dev.db";

const libsql = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSql(libsql as any);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
