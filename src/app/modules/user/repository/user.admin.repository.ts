import { UserStatus } from "../../../../generated/prisma/enums.js";
import { prisma } from "../../../../lib/prisma.js";

/**
 * Updates the status for a batch of users (e.g., blocking or unblocking).
 * Only modifies records that are not already in the target status.
 */
export const updateUsersStatusInDb = async (
  ids: string[],
  newStatus: UserStatus,
): Promise<number> => {
  const result = await prisma.user.updateMany({
    where: {
      id: { in: ids },
      status: { not: newStatus },
    },
    data: {
      status: newStatus,
    },
  });

  return result.count;
};

/**
 * Deletes a batch of users from the database by their IDs.
 * Returns the number of records successfully deleted.
 */
export const deleteUsersFromDb = async (ids: string[]): Promise<number> => {
  const result = await prisma.user.deleteMany({
    where: {
      id: { in: ids },
    },
  });

  return result.count;
};
