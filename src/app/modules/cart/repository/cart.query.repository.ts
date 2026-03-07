import { Prisma } from "../../../../generated/prisma/client.js";
import { prismaInstance } from "../../../../libs/prisma.js";
import { DbClient } from "../../../../libs/transactionWrapper.js";

// 1. Centralize your data shape
export const CART_INCLUDE_DETAILS = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            select: {
              productDisplayName: true,
              productBrand: true,
              globalImages: true,
            },
          },
        },
      },
    },
  },
} as const;

/**
 * Finds a unique cart (by ID or UserID) with full product details.
 */
export const findCartInDb = async (
  where: Prisma.CartWhereUniqueInput,
  tx: DbClient = prismaInstance, // Default allows standalone use
) => {
  return await tx.cart.findUnique({
    where,
    include: CART_INCLUDE_DETAILS,
  });
};

/**
 * Checks if a cart exists and returns a strict boolean.
 */
export const cartExistsInDb = async (
  cartId: string,
  tx: DbClient = prismaInstance,
) => {
  return await tx.cart.findUnique({
    where: { id: cartId },
    select: { id: true },
  });
};

