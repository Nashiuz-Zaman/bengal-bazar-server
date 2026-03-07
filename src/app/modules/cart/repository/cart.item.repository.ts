import { prismaInstance } from "../../../../lib/prisma.js";
import { DbClient } from "../../../../lib/transactionWrapper.js";

/**
 * Atomic Upsert: Adds a variant to the cart.
 * If the variant is already there, it increments the quantity.
 */
export const addItemToCartInDb = async (
  cartId: string,
  variantId: string,
  quantity: number,
  tx: DbClient = prismaInstance,
) => {
  return await tx.cartItem.upsert({
    where: {
      cartId_variantId: { cartId, variantId },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      cartId,
      variantId,
      quantity,
    },
  });
};

/**
 * Removes a variant from the cart.
 */
export const removeItemFromCartInDb = async (
  cartItemId: string,
  tx: DbClient = prismaInstance,
) => {
  return await tx.cartItem.delete({
    where: { id: cartItemId },
  });
};

/**
 * Updates quantity for a specific item.
 */
export const updateItemQuantityInDb = async (
  cartItemId: string,
  quantity: number,
  tx: DbClient = prismaInstance,
) => {
  await tx.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
};

export const findCartItemInDb = async (
  id: string,
  tx: DbClient = prismaInstance,
) => {
  return await tx.cartItem.findUnique({
    where: { id },
  });
};
