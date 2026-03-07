import { ApiError } from "../../../utils/ApiError.js";

import { findCouponByCode } from "./coupon.repository.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { DbClient } from "../../../libs/transactionWrapper.js";
import { formatPrice } from "../../../utils/formatPrice.js";

/**
 * Validates a coupon code against business rules and cart subtotal.
 * Throws ApiError if invalid. Returns the coupon if valid.
 */
export const validateCoupon = async (
  code: string,
  cartSubtotal: Prisma.Decimal,
  tx?: DbClient,
) => {
  // 1. Check if coupon exists
  const coupon = await findCouponByCode(code, tx);

  if (!coupon) {
    throw ApiError.NotFound("Invalid coupon code.");
  }

  // 2. Check Status
  if (coupon.status !== "ACTIVE") {
    throw ApiError.BadRequest("This coupon is no longer active.");
  }

  // 3. Check Date Validity
  const now = new Date();
  if (now < coupon.startDate) {
    throw ApiError.BadRequest("This coupon is not yet available.");
  }
  if (now > coupon.expiryDate) {
    throw ApiError.BadRequest("This coupon has expired.");
  }

  // 4. Check Usage Limits
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.BadRequest("Coupon usage limit reached");
  }

  // 5. Check Minimum Order Amount
  // cartSubtotal is a Prisma.Decimal, so we use .lessThan()
  if (cartSubtotal.lessThan(coupon.minimumOrderAmount)) {
    throw ApiError.BadRequest(
      `This coupon requires a minimum purchase of ${formatPrice(coupon.minimumOrderAmount.toFixed(2))}.`,
    );
  }

  return coupon;
};
