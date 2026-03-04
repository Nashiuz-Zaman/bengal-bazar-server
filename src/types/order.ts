import { Prisma } from "../generated/prisma/client.js";

export const orderWithItemsArgs = {
  include: {
    orderItems: true,
  },
} satisfies Prisma.OrderDefaultArgs;

export type TOrderWithItems = Prisma.OrderGetPayload<typeof orderWithItemsArgs>;
