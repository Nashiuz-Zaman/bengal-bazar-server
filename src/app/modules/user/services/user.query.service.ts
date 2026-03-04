import { ApiError } from "../../../../utils/ApiError.js";
import * as userRepo from "../user.repository.js";
import {
  ISingleUserQuery,
  TUserQueryDefaultFields,
} from "../../../../types/user.js";
import { User } from "../../../../generated/prisma/client.js";
import {
  IQueryMeta,
  TAllowedQueryExtraField,
} from "../../../../types/generic.js";

/**
 * Service to retrieve a paginated list of users with metadata.
 * Directly utilizes the repository's advanced filtering and pagination logic.
 * * @param query - The raw query object from the controller (req.query)
 * @returns An object containing the user array and pagination metadata
 */
export const getUsers = async (
  query: Record<string, any>,
): Promise<{
  data: Partial<User>[];
  meta: IQueryMeta;
}> => {
  const users = await userRepo.findUsersInDb(query);

  return users;
};
/**
 * Service to fetch a single user's profile.
 * Validates existence and throws a 404 if the ID is invalid or missing.
 * * @param id - The unique UUID of the user.
 * @param extraFields - Optional array of fields to include (e.g., "address").
 */
export const getUser = async (
  query: ISingleUserQuery,
  extraFields: TAllowedQueryExtraField<User, TUserQueryDefaultFields>[],
) => {
  const { email, id } = query;
  if (!email && !id) throw ApiError.BadRequest("User ID/Email is required");

  const user = await userRepo.findUser({ id, email }, extraFields);

  if (!user) {
    throw ApiError.NotFound(`User not found`);
  }

  return user;
};
