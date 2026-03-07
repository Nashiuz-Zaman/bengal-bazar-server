import { Prisma } from "../../../../generated/prisma/client.js";
import { prismaInstance } from "../../../../lib/prisma.js";
import { CART_INCLUDE_DETAILS } from "./cart.query.repository.js";
import { DbClient } from "../../../../lib/transactionWrapper.js";

/**
 * Creates a new cart.
 */
export const createCartInDb = async (
  userId?: string,
  tx: DbClient = prismaInstance,
) => {
  return await tx.cart.create({
    data: {
      userId: userId || null,
    },
    select: { id: true },
  });
};

/**
 * Deletes the entire cart and its items.
 */
export const deleteCartFromDb = async (
  cartId: string,
  tx: DbClient = prismaInstance,
) => {
  return await tx.cart.delete({
    where: { id: cartId },
  });
};

/**
 * Updates only the financial totals and quantity counters.
 */
export const updateCartTotalsInDb = async (
  cartId: string,
  data: Pick<
    Prisma.CartUpdateInput,
    | "subtotal"
    | "total"
    | "totalItemQty"
    | "discount"
    | "tax"
    | "shippingFee"
    | "couponCode"
  >,
  tx: DbClient = prismaInstance,
) => {
  return await tx.cart.update({
    where: { id: cartId },
    data,
  });
};

/**
 * Assigns a guest cart to a user.
 */
export const updateCartOwnerInDb = async (
  cartId: string,
  userId: string,
  tx: DbClient = prismaInstance,
) => {
  return await tx.cart.update({
    where: { id: cartId },
    data: { userId },
    include: CART_INCLUDE_DETAILS,
  });
};
