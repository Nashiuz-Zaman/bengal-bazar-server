import { Session, UserRole } from "../../../../generated/prisma/client.js";
import { prisma } from "../../../../lib/prisma.js";

/**
 * Creates a new session record.
 */
export const createSession = async (data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) => {
  return await prisma.session.create({ data });
};

/**
 * Finds a session. If it's expired, Prisma returns null
 * because of the date check.
 */
export const findValidSession = async (
  tokenHash: string,
): Promise<(Session & { user: { role: UserRole } }) | null> => {
  return await prisma.session.findUnique({
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
export const deleteSession = async (tokenHash: string): Promise<void> => {
  await prisma.session.deleteMany({
    where: { tokenHash },
  });
};

/**
 * Useful for 'Logout from all devices' or Password Changes.
 */
export const deleteAllUserSessions = async (userId: string): Promise<void> => {
  await prisma.session.deleteMany({
    where: { userId },
  });
};
