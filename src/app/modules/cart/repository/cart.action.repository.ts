import { Prisma } from "../../../../generated/prisma/client.js";
import { prismaInstance } from "../../../../lib/prisma.js";
import { CART_INCLUDE_DETAILS } from "./cart.query.repository.js";

/**
 * Creates a new cart.
 * Works for both logged-in users (with userId) and guest users (without userId).
 */
export const createCart = async (userId?: string) => {
  return await prismaInstance.cart.create({
    data: {
      userId: userId || null,
    },
  });
};

/**
 * Deletes the entire cart and its items
 */
export const deleteCart = async (cartId: string) => {
  return await prismaInstance.cart.delete({
    where: { id: cartId },
  });
};

/**
 * Updates only the financial totals and quantity counters.
 */
export const updateCartTotals = async (
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
) => {
  return await prismaInstance.cart.update({
    where: { id: cartId },
    data,
    include: CART_INCLUDE_DETAILS, // Return the full cart so the service has the new numbers
  });
};

/**
 * Assigns a guest cart to a user (used during Login/Merge).
 */
export const updateCartOwner = async (cartId: string, userId: string) => {
  return await prismaInstance.cart.update({
    where: { id: cartId },
    data: { userId },
    include: CART_INCLUDE_DETAILS,
  });
};
