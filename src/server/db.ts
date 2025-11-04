import * as Prisma from "../generated/prisma"
const { PrismaClient } = Prisma


const globalForPrisma = globalThis as unknown as { prisma: Prisma.PrismaClient | undefined }

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
