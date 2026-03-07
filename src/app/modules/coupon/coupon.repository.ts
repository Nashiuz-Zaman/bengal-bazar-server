import { prismaInstance } from "../../../libs/prisma.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { DbClient } from "../../../libs/transactionWrapper.js";

/**
 * Finds a specific coupon by its unique string code.
 */
export const findCouponByCode = async (
  code: string,
  tx: DbClient = prismaInstance,
) => {
  return await tx.coupon.findUnique({
    where: { code },
  });
};

/**
 * Atomically increments the usedCount of a coupon.
 */
export const incrementCouponUsage = async (
  couponId: string,
  tx: DbClient = prismaInstance,
) => {
  return await tx.coupon.update({
    where: { id: couponId },
    data: {
      usedCount: { increment: 1 },
    },
  });
};

/**
 * Atomically decrements the usedCount of a coupon.
 */
export const decrementCouponUsage = async (
  couponId: string,
  tx: DbClient = prismaInstance,
) => {
  return await tx.coupon.update({
    where: { id: couponId },
    data: {
      usedCount: { decrement: 1 },
    },
  });
};

/**
 * Creates a new coupon.
 */
export const createCoupon = async (
  data: Prisma.CouponCreateInput,
  tx: DbClient = prismaInstance,
) => {
  return await tx.coupon.create({
    data,
  });
};

/**
 * Updates coupon details.
 */
export const updateCoupon = async (
  id: string,
  data: Prisma.CouponUpdateInput,
  tx: DbClient = prismaInstance,
) => {
  return await tx.coupon.update({
    where: { id },
    data,
  });
};

/**
 * Deletes a coupon.
 */
export const deleteCoupon = async (
  id: string,
  tx: DbClient = prismaInstance,
) => {
  return await tx.coupon.delete({
    where: { id },
  });
};

/**
 * Checks if a coupon exists.
 */
export const couponExists = async (
  couponCode: string,
  tx: DbClient = prismaInstance,
) => {
  return await tx.coupon.findUnique({
    where: { code: couponCode },
    select: { id: true },
  });
};
