import { UserStatus } from "../../../../generated/prisma/client.js";
import { ApiError } from "../../../../utils/ApiError.js";

import { hasElements } from "../../../../utils/hasElements.js";
import {
  deleteUsersFromDb,
  updateUsersStatusInDb,
} from "../repository/user.admin.repository.js";

/**
 * Service to handle batch blocking of users.
 * Validates the presence of IDs and provides a descriptive success message.
 */
export const blockUsers = async (ids: string[]): Promise<string> => {
  if (!hasElements(ids))
    throw ApiError.BadRequest("No user IDs provided for blocking");

  const modifiedCount = await updateUsersStatusInDb(ids, UserStatus.BLOCKED);

  // If no records were changed, they might already be blocked or the IDs are invalid
  if (modifiedCount === 0) {
    return "No users were blocked";
  }

  return `${modifiedCount} user(s) have been successfully blocked.`;
};

/**
 * Service to handle batch unblocking of users.
 * Transitions users back to ACTIVE status.
 */
export const unblockUsers = async (ids: string[]): Promise<string> => {
  if (!hasElements(ids))
    throw ApiError.BadRequest("No user IDs provided for unblocking.");

  const modifiedCount = await updateUsersStatusInDb(ids, UserStatus.ACTIVE);

  if (modifiedCount === 0) throw ApiError.NotFound("No users were unblocked");

  return `${modifiedCount} user(s) have been successfully unblocked.`;
};

/**
 * Service to handle batch deletion of users.
 * Ensures IDs are provided before attempting the database operation.
 */
export const deleteUsers = async (ids: string[]): Promise<string> => {
  if (!hasElements(ids))
    throw ApiError.BadRequest("No user IDs provided for deletion.");

  const deletedCount = await deleteUsersFromDb(ids);

  if (deletedCount === 0)
    throw ApiError.NotFound("No users were found to delete.");

  return `${deletedCount} user(s) have been deleted.`;
};
