import { Prisma } from "../generated/prisma/client.js";
import { prismaInstance } from "./prisma.js";

/**
 * Global type for the Transaction Client.
 * Use this in your repository functions to allow them to accept either
 * the standard prismaInstance or a transaction client.
 */
export type DbClient = Prisma.TransactionClient | typeof prismaInstance;

/**
 * Transaction Wrapper: Executes a set of repository calls within a single ACID transaction.
 * This prevents Prisma from leaking into the service logic while ensuring
 * all-or-nothing execution.
 */
export const runInTransaction = async <T>(
  callback: (tx: DbClient) => Promise<T>,
): Promise<T> => {
  return await prismaInstance.$transaction(async (tx) => callback(tx));
};
