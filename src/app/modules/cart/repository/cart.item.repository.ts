import { prismaInstance } from "../../../../lib/prisma.js";

/**
 * Atomic Upsert: Adds a variant to the cart.
 * If the variant is already there, it increments the quantity.
 */
export const addItemToCart = async (
  cartId: string,
  variantId: string,
  quantity: number,
) => {
  return await prismaInstance.cartItem.upsert({
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
export const removeItemFromCart = async (cartItemId: string) => {
  return await prismaInstance.cartItem.delete({
    where: { id: cartItemId },
  });
};

/**
 * Updates quantity for a specific item.
 */
export const updateItemQuantity = async (
  cartItemId: string,
  quantity: number,
) => {
  return await prismaInstance.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
};
