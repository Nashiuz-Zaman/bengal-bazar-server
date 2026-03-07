import { emptyGuestCart } from "../../../../constants/cart.constant.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import { runInTransaction } from "../../../../libs/transactionWrapper.js";
import { TCartWithItems } from "../../../../types/cart.js";
import {
  deleteCartFromDb,
  updateCartOwnerInDb,
} from "../repository/cart.action.repository.js";
import { addItemToCartInDb } from "../repository/cart.item.repository.js";
import { findCartInDb } from "../repository/cart.query.repository.js";
import { autoSyncCartTotals } from "./cart.action.service.js";

export const getCart = async (userId?: string, cartId?: string) => {
  // Run inside a transaction
  return await runInTransaction(async (tx) => {
    const localEmptyCart = { ...emptyGuestCart, userId: userId || null };

    if (cartId) {
      // There is a guest cart (cookie exists)
      const guestCart = await findCartInDb({ id: cartId });

      // Edge case: Cookie exists, but DB record was deleted
      if (!guestCart) {
        if (userId) {
          const userCart = await findCartInDb({ userId });
          return { cart: userCart || localEmptyCart, clearCookie: true };
        }
        return { cart: localEmptyCart, clearCookie: true };
      }

      if (userId) {
        // User is logged in
        const userCart = await findCartInDb({ userId });

        if (userCart) {
          // Merge: User has a cart AND a guest cart exists
          for (const item of guestCart.items) {
            await addItemToCartInDb(userCart.id, item.variantId, item.quantity);
          }

          // Delete the guest cart after merging
          await deleteCartFromDb(guestCart.id);

          await autoSyncCartTotals(userCart.id);

          const updatedUserCart = await findCartInDb({ id: userCart.id });

          return { cart: updatedUserCart, clearCookie: true };
        } else {
          // Takeover: Turn the guest cart into user cart
          const updatedCart = await updateCartOwnerInDb(guestCart.id, userId);
          return { cart: updatedCart, clearCookie: true };
        }
      } else {
        // No user logged in, just return the guest cart
        return { cart: guestCart, clearCookie: false };
      }
    } else {
      // There is no guest cart (no cookie)
      if (userId) {
        // User has a cart? Return it. If not, return empty cart.
        const userCart = await findCartInDb({ userId });
        return { cart: userCart || localEmptyCart, clearCookie: false };
      } else {
        // Return an empty cart data structure, don't create any cart in the db
        return { cart: localEmptyCart, clearCookie: false };
      }
    }
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
