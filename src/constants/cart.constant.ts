import { Prisma } from "../generated/prisma/client.js";
import { TCartWithItems } from "../types/cart.js";

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
