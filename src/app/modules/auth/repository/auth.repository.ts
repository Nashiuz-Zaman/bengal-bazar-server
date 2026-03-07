import { User } from "../../../../generated/prisma/client.js";
import { prismaInstance } from "../../../../lib/prisma.js";

/**
 * Internal-only method to get a user WITH the password hash.
 * This should ONLY be used in the Auth Service for credential verification.
 */
export const findUserForAuthInDb = async (email: string) => {
  return await prismaInstance.user.findUnique({
    where: { email },
    select: {
      email: true,
      password: true,
      id: true,
      image: true,
      name: true,
      role: true,
    },
  });
};

/**
 * Used for Password Changes. Updates hash and kills all active sessions.
 */
export const updatePasswordInDb = async (
  userId: string,
  passwordHash: string,
): Promise<Omit<User, "password">> => {
  return await prismaInstance.user.update({
    where: { id: userId },
    data: {
      password: passwordHash,
      sessions: { deleteMany: {} }, // Security: Logout everywhere
    },
    omit: { password: true },
  });
};
