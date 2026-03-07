import { Coupon } from "../../../../generated/prisma/client.js";
import {
  DbClient,
  runInTransaction,
} from "../../../../libs/transactionWrapper.js";

import { ApiError } from "../../../../utils/ApiError.js";
import { validateCoupon } from "../../coupon/coupon.service.js";
import { calculateCartTotals, getSubtotalAndTotalQty } from "../cart.util.js";
import {
  deleteCartFromDb,
  updateCartTotalsInDb,
} from "../repository/cart.action.repository.js";
import { findCartInDb } from "../repository/cart.query.repository.js";
import { emptyGuestCart } from "../../../../constants/cart.constant.js";

/**
 * Automatically syncs cart totals and removes invalid coupons
 */
export const autoSyncCartTotals = async (cartId: string, tx?: DbClient) => {
  const cart = await findCartInDb({ id: cartId }, tx);
  if (!cart) return;

  // 1. Calculate subtotal and qty ONCE
  const currentTotals = getSubtotalAndTotalQty(cart.items);

  // 2. Handle Coupon Validation
  let validCoupon: Coupon | null = null;
  if (cart.couponCode) {
    try {
      // Use the pre-calculated subtotal to validate
      validCoupon = await validateCoupon(
        cart.couponCode,
        currentTotals.subtotal,
        tx,
      );
    } catch (error) {
      // Coupon invalid? Heal the cart by setting validCoupon to null
      validCoupon = null;
    }
  }

  // 3. Call calculation function with pre-calculated data
  const newTotals = calculateCartTotals(
    cart.items,
    validCoupon,
    false,
    currentTotals, // Pass the work we already did
  );

  // 4. Persist to DB
  await updateCartTotalsInDb(
    cartId,
    {
      subtotal: newTotals.subtotal,
      discount: newTotals.discount,
      tax: newTotals.tax,
      shippingFee: newTotals.shippingFee,
      total: newTotals.total,
      totalItemQty: newTotals.totalItemQty,
      couponCode: newTotals.couponCode,
    },
    tx,
  );

  return;
};

/**
 * Adds a coupon to cart
 */
export const addCouponToCart = async (cartId: string, couponCode: string) => {
  return await runInTransaction(async (tx) => {
    // 1. Fetch within the transaction to "lock" the state
    const cart = await findCartInDb({ id: cartId }, tx);
    if (!cart) throw ApiError.NotFound("Cart not found.");

    // 2. Validate and calculate
    const coupon = await validateCoupon(couponCode, cart.subtotal, tx);
    const newTotals = calculateCartTotals(cart.items, coupon);

    // 3. Save
    return await updateCartTotalsInDb(cartId, newTotals, tx);
  });
};

/**
 * Removes a coupon from the cart
 */
export const removeCouponFromCart = async (cartId: string) => {
  return await runInTransaction(async (tx) => {
    if (!cartId) throw ApiError.BadRequest("Cart id is required");

    const cart = await findCartInDb({ id: cartId }, tx);

    if (!cart) throw ApiError.NotFound("Cart not found.");
    const newTotals = calculateCartTotals(cart.items);

    return await updateCartTotalsInDb(cartId, newTotals, tx);
  });
};

/**
 * Clears and deletes the cart
 */
export const clearCart = async (cartid: string) => {
  if (!cartid) throw ApiError.BadRequest("Cart id is required");

  await deleteCartFromDb(cartid);

  return emptyGuestCart;
};
