import { prisma } from "@beerpong/db";

export { prisma };
export const getPrisma = () => prisma;
