import { prismaInstance } from "../../../../libs/prisma.js";

export const createPasswordResetTokenInDb = async (data: {
  userId: string;
  token: string;
  expiresAt: Date;
}) => {
  // Clear any old reset tokens for this user first
  await prismaInstance.passwordReset.deleteMany({ where: { userId: data.userId } });
  return await prismaInstance.passwordReset.create({ data });
};

export const findValidPasswordResetTokenInDb = async (token: string) => {
  return await prismaInstance.passwordReset.findFirst({
    where: { token, expiresAt: { gt: new Date() } },
    include: { user: true }, // Get the user info at the same time
  });
};

export const deletePasswordResetTokenInDb = async (token: string) => {
  return await prismaInstance.passwordReset.deleteMany({ where: { token } });
};
