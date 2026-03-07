import { Prisma } from "../../../../generated/prisma/client.js";
import { TCartWithItems } from "../../../../types/cart.js";
import {
  deleteCartFromDb,
  updateCartOwnerInDb,
} from "../repository/cart.action.repository.js";
import { addItemToCartInDb } from "../repository/cart.item.repository.js";
import { findCartInDb } from "../repository/cart.query.repository.js";
import { autoSyncCartTotals } from "./cart.action.service.js";

// Empty Cart
export const emptyGuestCart: TCartWithItems = {
  id: "",
  items: [],
  userId: null,
  couponCode: null,
  discount: new Prisma.Decimal(0),
  tax: new Prisma.Decimal(0),
  shippingFee: new Prisma.Decimal(0),
  subtotal: new Prisma.Decimal(0),
  total: new Prisma.Decimal(0),
  totalItemQty: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const getCart = async (userId?: string, cartId?: string) => {
  if (userId) emptyGuestCart.userId = userId;

  if (cartId) {
    // There is a guest cart (cookie exists)
    const guestCart = await findCartInDb({ id: cartId });

    // Edge case: Cookie exists, but DB record was deleted
    if (!guestCart) {
      if (userId) {
        const userCart = await findCartInDb({ userId });
        return { cart: userCart || emptyGuestCart, clearCookie: true };
      }
      return { cart: emptyGuestCart, clearCookie: true };
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
      return { cart: userCart || emptyGuestCart, clearCookie: false };
    } else {
      // Return an empty cart data structure, don't create any cart in the db
      return { cart: emptyGuestCart, clearCookie: false };
    }
  }
};
