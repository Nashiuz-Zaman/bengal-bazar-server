import { Coupon, Prisma } from "../../../../generated/prisma/client.js";
import { DbClient } from "../../../../lib/transactionWrapper.js";
import { TCartItemWithVariant } from "../../../../types/cart.js";
import { ApiError } from "../../../../utils/ApiError.js";
import { validateCoupon } from "../../coupon/coupon.service.js";
import {
  getDiscountAmount,
  getShippingAndTax,
  getSubtotalAndTotalQty,
} from "../cart.util.js";
import {
  deleteCartFromDb,
  updateCartTotalsInDb,
} from "../repository/cart.action.repository.js";
import { findCartInDb } from "../repository/cart.query.repository.js";
import { emptyGuestCart } from "./cart.query.service.js";

/**
 * Calculates all financial totals for a cart.
 * Can accept pre-calculated subtotal/qty to avoid redundant loops.
 */
export const calculateCartTotals = (
  items: TCartItemWithVariant[],
  coupon: Coupon | null = null,
  calculateSubtotalAndTotalQty = true,
  preCalculated?: { subtotal: Prisma.Decimal; totalItemQty: number },
) => {
  // 1. Determine subtotal and item qty based on the toggle
  const { subtotal, totalItemQty } = calculateSubtotalAndTotalQty
    ? getSubtotalAndTotalQty(items)
    : (preCalculated ?? getSubtotalAndTotalQty(items)); // Fallback

  // 2. Calculate Discount Amount
  let discountAmount = new Prisma.Decimal(0);

  if (coupon) {
    discountAmount = getDiscountAmount(coupon, subtotal);
  }

  // 3. Calculate shipping and tax
  const { shippingFee, tax, taxableAmount } = getShippingAndTax(
    subtotal,
    discountAmount,
  );

  // 4. Final Total
  const total = taxableAmount.plus(tax).plus(shippingFee);

  return {
    subtotal,
    discount: discountAmount,
    tax,
    shippingFee,
    total,
    totalItemQty,
    couponCode: coupon?.code ?? null,
  };
};

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
  if (!cartId || !couponCode)
    throw ApiError.BadRequest("Cart id and coupon code are required");

  const cart = await findCartInDb({ id: cartId });
  if (!cart) throw ApiError.NotFound("Cart not found.");

  const coupon = await validateCoupon(couponCode, cart.subtotal);
  const newTotals = calculateCartTotals(cart.items, coupon);

  return await updateCartTotalsInDb(cartId, newTotals);
};

/**
 * Removes a coupon from the cart
 */
export const removeCouponFromCart = async (cartId: string) => {
  if (!cartId) throw ApiError.BadRequest("Cart id is required");

  const cart = await findCartInDb({ id: cartId });

  if (!cart) throw ApiError.NotFound("Cart not found.");
  const newTotals = calculateCartTotals(cart.items);

  return await updateCartTotalsInDb(cartId, newTotals);
};

/**
 * Clears and deletes the cart
 */
export const clearCart = async (cartid: string) => {
  if (!cartid) throw ApiError.BadRequest("Cart id is required");

  await deleteCartFromDb(cartid);

  return emptyGuestCart;
};


