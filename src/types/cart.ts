import { Prisma } from "../generated/prisma/client.js";

export type TCartWithItems = Prisma.CartGetPayload<{
  include: { items: true };
}>;

export type TCartItemWithVariant = Prisma.CartItemGetPayload<{
  include: { variant: true };
}>;
