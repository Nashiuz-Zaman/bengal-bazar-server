import { Prisma, User, UserStatus } from "../../../generated/prisma/client.js";
import { prisma } from "../../../prisma.js";
import { IQueryMeta, TStringKeyOf } from "../../types/generic.js";
import {
  buildFilters,
  getPagination,
  getSearch,
  getSorting,
} from "../../utils/prismaHelpers.js";

type TDefaultUserFields =
  | "name"
  | "id"
  | "email"
  | "phone"
  | "image"
  | "status"
  | "role"
  | "lastLoginAt"
  | "isVerified";

type TAllowedExtraFields = Exclude<TStringKeyOf<User>, TDefaultUserFields>;

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
 * Finds a single user based on their id
 * Supports projecting additional fields beyond the base selection.
 */
export const findUser = async (
  id: string,
  extraFields: TAllowedExtraFields[] = [],
): Promise<Partial<User> | null> => {
  const baseSelect: Prisma.UserSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    image: true,
    status: true,
    role: true,
    lastLoginAt: true,
    isVerified: true,
  };

  extraFields.forEach((field) => {
    (baseSelect as any)[field] = true;
  });

  return await prisma.user.findUnique({
    where: {
      id,
    },
    select: baseSelect,
  });
};

// --- Deletion Logic ---
export const deleteUserFromDb = async (id: string) => {
  return await prisma.user.delete({
    where: { id },
  });
};

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
 * Count users based on a filter.
 * Used alongside findMany for total page calculation.
 */
export const countUsersInDb = async (
  where: Prisma.UserWhereInput,
): Promise<number> => {
  return await prisma.user.count({ where });
};

/**
 * Internal-only method to get a user WITH the password.
 * Only use this in Auth/Login service for bcrypt.compare().
 */
export const findUserForAuth = async (email: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { email },
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
 * Fetches a paginated, filtered, and sorted list of users.
 * Includes metadata for frontend pagination controls.
 * @param query - Raw express query object (req.query)
 */
export const findAllUsersInDb = async (
  query: Record<string, any>,
): Promise<{
  data: Partial<User>[];
  meta: IQueryMeta;
}> => {
  // 1. Prepare query components
  const { skip, take, page } = getPagination(query);
  const orderBy = getSorting(query, "createdAt");
  const search = getSearch(query.searchTerm as string, [
    "name",
    "email",
    "phone",
  ]);
  const filters = buildFilters(query);

  // 2. Combine Search and Filters
  const where: Prisma.UserWhereInput = {
    AND: [filters, search],
  };

  // 3. Execute queries in parallel for better performance
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      omit: { password: true },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};
