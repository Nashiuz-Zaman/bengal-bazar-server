import { Session, UserRole } from "../../../../generated/prisma/client.js";
import { prismaInstance } from "../../../../lib/prisma.js";

/**
 * Creates a new session record.
 */
export const createSessionInDb = async (data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) => {
  return await prismaInstance.session.create({ data });
};

/**
 * Finds a session. If it's expired, Prisma returns null
 * because of the date check.
 */
export const findValidSessionInDb = async (
  tokenHash: string,
): Promise<(Session & { user: { role: UserRole } }) | null> => {
  return await prismaInstance.session.findUnique({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() }, // Only find if current time is before expiry
    },
    include: { user: { select: { role: true } } },
  });
};

/**
 * Replaces 'revokeSession'. Since we don't have a 'revoked' field,
 * we delete the session record entirely to invalidate it.
 */
export const deleteSessionInDb = async (tokenHash: string): Promise<void> => {
  await prismaInstance.session.deleteMany({
    where: { tokenHash },
  });
};

/**
 * Useful for 'Logout from all devices' or Password Changes.
 */
export const deleteAllUserSessions = async (userId: string): Promise<void> => {
  await prismaInstance.session.deleteMany({
    where: { userId },
  });
};
