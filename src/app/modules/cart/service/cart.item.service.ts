import { runInTransaction } from "../../../../lib/transactionWrapper.js";
import { ApiError } from "../../../../utils/ApiError.js";
import { createCartInDb } from "../repository/cart.action.repository.js";
import {
  addItemToCartInDb,
  findCartItemInDb,
  removeItemFromCartInDb,
  updateItemQuantityInDb,
} from "../repository/cart.item.repository.js";
import { findCartInDb } from "../repository/cart.query.repository.js";
import { autoSyncCartTotals } from "./cart.action.service.js";

/**
 * Add Item: Handles the logic of creating a cart if missing + syncing totals.
 */
export const addItemToCart = async (
  variantId: string,
  quantity: number = 1,
  cartId?: string,
  userId?: string,
) => {
  if (!variantId) throw ApiError.BadRequest("Variant ID is required");

  // Atomic db action via transaction
  return await runInTransaction(async (tx) => {
    const cartType = userId ? "user" : "guest";
    let isNewCart = false;
    let newOrUpdatedCartId = "";

    if (cartType === "guest") {
      if (!cartId) {
        // Pass 'tx' to every function to keep them in this specific transaction
        const newGuestCart = await createCartInDb(undefined, tx);
        await addItemToCartInDb(newGuestCart.id, variantId, quantity, tx);
        isNewCart = true;
        newOrUpdatedCartId = newGuestCart.id;
      } else {
        await addItemToCartInDb(cartId, variantId, quantity, tx);
        newOrUpdatedCartId = cartId;
      }
    } else if (cartType === "user") {
      const existingUsercart = await findCartInDb({ userId }, tx);

      if (!existingUsercart?.id) {
        const newUserCart = await createCartInDb(userId, tx);
        await addItemToCartInDb(newUserCart.id, variantId, quantity, tx);
        isNewCart = true;
        newOrUpdatedCartId = newUserCart.id;
      } else {
        await addItemToCartInDb(existingUsercart.id, variantId, quantity, tx);
        newOrUpdatedCartId = existingUsercart.id;
      }
    }

    // Syncing totals must happen within the same transaction to be safe
    await autoSyncCartTotals(newOrUpdatedCartId, tx);

    // Fetch the final state using the transaction client
    const cartData = await findCartInDb({ id: newOrUpdatedCartId }, tx);

    return { cartData, isNewCart, cartType };
  });
};

/**
 * Updates quantity for a specific order item within a transaction.
 */
export const updateCartItemQty = async (
  cartId: string,
  cartItemId: string,
  quantity: number = 0,
) => {
  if (!cartId || !cartItemId)
    throw ApiError.BadRequest("Cart and item Id are required");

  return await runInTransaction(async (tx) => {
    // 1. Remove from cart if new qty is 0
    if (quantity <= 0) {
      await removeItemFromCartInDb(cartItemId, tx);
      await autoSyncCartTotals(cartId, tx);
      return await findCartInDb({ id: cartId }, tx);
    }

    const item = await findCartItemInDb(cartItemId);

    if (!item || item.cartId !== cartId) {
      throw ApiError.NotFound("Item not found in cart");
    }

    await updateItemQuantityInDb(cartItemId, quantity, tx);
    await autoSyncCartTotals(cartId, tx);

    return await findCartInDb({ id: cartId }, tx);
  });
};

/**
 * Removes an item from the cart and triggers a total recalculation.
 */
export const removeItemFromCart = async (
  cartId: string,
  cartItemId: string,
) => {
  if (!cartId || !cartItemId) {
    throw ApiError.BadRequest("Cart ID and Item ID are required");
  }

  return await runInTransaction(async (tx) => {
    //  Ownership & Existence Check
    const item = await findCartItemInDb(cartItemId, tx);

    if (!item || item.cartId !== cartId) {
      throw ApiError.NotFound("Item not found in the specified cart");
    }

    await removeItemFromCartInDb(cartItemId, tx);
    await autoSyncCartTotals(cartId, tx);
    return await findCartInDb({ id: cartId }, tx);
  });
};
