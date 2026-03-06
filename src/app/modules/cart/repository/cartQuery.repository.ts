import { Prisma } from "../../../../generated/prisma/client.js";
import { prismaInstance } from "../../../../lib/prisma.js";

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
export const findCart = async (where: Prisma.CartWhereUniqueInput) => {
  return await prismaInstance.cart.findUnique({
    where,
    include: CART_INCLUDE_DETAILS,
  });
};

/**
 * Checks if a cart exists and returns a strict boolean.
 */
export const cartExists = async (cartId: string): Promise<boolean> => {
  const cart = await prismaInstance.cart.findUnique({
    where: { id: cartId },
    select: { id: true },
  });
  return !!cart;
};
