import { Cart, Coupon, Prisma } from "../../../generated/prisma/client.js";
import { TCartItemWithVariant } from "../../../types/cart.js";

export const getSubtotalAndTotalQty = (items: TCartItemWithVariant[]) => {
  let subtotal = new Prisma.Decimal(0);
  let totalItemQty = 0;

  items.forEach((item) => {
    const price =
      item.variant.discountSalesPrice || item.variant.unitSalesPrice;
    const quantity = item.quantity;

    subtotal = subtotal.plus(price.times(quantity));
    totalItemQty += quantity;
  });

  return { subtotal, totalItemQty };
};

export const getDiscountAmount = (coupon: Coupon, subtotal: Prisma.Decimal) => {
  let discountAmount = new Prisma.Decimal(0);

  if (coupon.discountType === "FLAT") {
    discountAmount = coupon.discountValue;
  } else if (coupon.discountType === "PERCENTAGE") {
    // if discountValue is 20, calculate: subtotal * (20 / 100)
    const percentage = coupon.discountValue.dividedBy(100);
    discountAmount = subtotal.times(percentage);
  }

  // Edge Case Protection: Don't let the discount exceed the subtotal
  // If cart is $30 and flat coupon is $50, the discount is capped at $30
  if (discountAmount.gt(subtotal)) {
    discountAmount = subtotal;
  }

  return discountAmount;
};

export const getShippingAndTax = (
  subtotal: Cart["subtotal"],
  discount: Cart["discount"],
) => {
  // Hardcoded shipping: Always 500 (unless cart is empty)
  const shippingFee = new Prisma.Decimal(subtotal.gt(0) ? 500 : 0);

  // Tax: Always 5% of subtotal (applied to the amount AFTER the discount)
  const taxableAmount = subtotal.minus(discount);
  const taxRate = new Prisma.Decimal(0.05);
  const tax = taxableAmount.times(taxRate);

  return { shippingFee, tax, taxableAmount };
};

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
