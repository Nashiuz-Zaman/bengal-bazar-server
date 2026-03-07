import { Prisma } from "../../../../generated/prisma/client.js";
import { prismaInstance } from "../../../../lib/prisma.js";
import { DbClient } from "../../../../lib/transactionWrapper.js";

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

/**
 * Find out the actual carts Id resolving from userId or cartId in the cookie
 */
export const resolveCartId = async (userId?: string, cookieCartId?: string) => {
  if (userId) {
    const cart = await findCartInDb({ userId });
    return cart?.id;
  }
  return cookieCartId;
};
