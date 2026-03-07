import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { config } from "../config/env.js";

const connectionString = config.postgresConnecionStr!;

const adapter = new PrismaPg({ connectionString });

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prismaInstance =
  global.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaInstance;
}