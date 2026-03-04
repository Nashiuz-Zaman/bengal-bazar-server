import { prisma } from "../../../../lib/prisma.js";

export const createResetToken = async (data: {
  userId: string;
  token: string;
  expiresAt: Date;
}) => {
  // Clear any old reset tokens for this user first
  await prisma.passwordReset.deleteMany({ where: { userId: data.userId } });
  return await prisma.passwordReset.create({ data });
};

export const findValidResetToken = async (token: string) => {
  return await prisma.passwordReset.findFirst({
    where: { token, expiresAt: { gt: new Date() } },
    include: { user: true }, // Get the user info at the same time
  });
};

export const deleteResetToken = async (token: string) => {
  return await prisma.passwordReset.deleteMany({ where: { token } });
};
