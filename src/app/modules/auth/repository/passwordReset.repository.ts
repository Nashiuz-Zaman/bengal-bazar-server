import { prisma } from "../../../../lib/prisma.js";

export const createPasswordResetToken = async (data: {
  userId: string;
  token: string;
  expiresAt: Date;
}) => {
  // Clear any old reset tokens for this user first
  await prisma.passwordReset.deleteMany({ where: { userId: data.userId } });
  return await prisma.passwordReset.create({ data });
};

export const findValidPasswordResetToken = async (token: string) => {
  return await prisma.passwordReset.findFirst({
    where: { token, expiresAt: { gt: new Date() } },
    include: { user: true }, // Get the user info at the same time
  });
};

export const deletePasswordResetToken = async (token: string) => {
  return await prisma.passwordReset.deleteMany({ where: { token } });
};
