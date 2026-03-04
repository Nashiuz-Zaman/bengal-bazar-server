import { Prisma } from "../../../../generated/prisma/client.js";
import { prisma } from "../../../../lib/prisma.js";

/**
 * Creates a single user
 */
export const createUser = async (data: Prisma.UserCreateInput) => {
  return await prisma.user.create({ data, omit: { password: true } });
};

/**
 * Updates a single user by ID.
 * Uses 'omit' to ensure sensitive data isn't returned to the service layer.
 */
export const updateUserInDb = async (
  id: string,
  data: Prisma.UserUpdateInput,
) => {
  return await prisma.user.update({
    where: { id },
    data,
    omit: { password: true },
  });
};

/**
 * Upsert User: Useful for OAuth (Google/Github login).
 * Creates the user if they don't exist, updates them if they do.
 */
export const upsertUserInDb = async (
  email: string,
  data: Prisma.UserCreateInput,
) => {
  return await prisma.user.upsert({
    where: { email },
    update: { lastLoginAt: new Date() },
    create: data,
    omit: { password: true },
  });
};

/**
 * Specialized update for the email verification process.
 */
export const verifyUserInDb = async (id: string) => {
  return await prisma.user.update({
    where: { id },
    data: {
      isVerified: true,
      emailVerificationToken: null,
      verificationExpiresAt: null,
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
    },
    omit: { password: true },
  });
};

/**
 * Updates only the verification token.
 */
export const updateVerificationTokenInDb = async (
  id: string,
  token: string,
) => {
  return await prisma.user.update({
    where: { id },
    data: { emailVerificationToken: token },
  });
};
