import { Prisma, User } from "../../../../generated/prisma/client.js";
import { prismaInstance } from "../../../../lib/prisma.js";
import {
  IQueryMeta,
  TAllowedQueryExtraField,
} from "../../../../types/generic.js";
import {
  ISingleUserQuery,
  TUserQueryDefaultFields,
} from "../../../../types/user.js";
import {
  buildFilters,
  getPagination,
  getSearch,
  getSorting,
} from "../../../../utils/prismaHelpers.js";
import { USER_SEARCHABLE_FIELDS } from "../user.constants.js";

/**
 * Checks if an user exists and returns id, role and status of the user.
 */
export const userExists = async (id: string) => {
  const user = await prismaInstance.user.findUnique({
    where: { id },
    select: { id: true, role: true, status: true },
  });
  return user;
};

/**
 * Finds a single user with dynamic field selection.
 * Guaranteed to NEVER return the password field, even if requested in extraFields.
 */
export const findUser = async (
  query: ISingleUserQuery,
  extraFields: TAllowedQueryExtraField<User, TUserQueryDefaultFields>[] = [],
): Promise<Partial<User> | null> => {
  // 1. Define the mandatory fields we always want
  const select: Prisma.UserSelect = {
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

  // 2. Add extra fields dynamically, but skip 'password' for security
  extraFields.forEach((field) => {
    if (field !== "password") {
      (select as any)[field] = true;
    }
  });

  // 3. Execute query with type-safe where clause
  return await prismaInstance.user.findUnique({
    where: (query.email
      ? { email: query.email }
      : { id: query.id }) as Prisma.UserWhereUniqueInput,
    select,
  });
};

/**
 * Count users based on a filter.
 * Used alongside findMany for total page calculation.
 */
export const countUsersInDb = async (
  where: Prisma.UserWhereInput,
): Promise<number> => {
  return await prismaInstance.user.count({ where });
};

/**
 * Fetches a paginated, filtered, and sorted list of users.
 * Includes metadata for frontend pagination controls.
 * @param query - Raw express query object (req.query)
 */
export const findUsersInDb = async (
  query: Record<string, any>,
): Promise<{
  data: Partial<User>[];
  meta: IQueryMeta;
}> => {
  // 1. Prepare query components
  const { skip, take, page } = getPagination(query);
  const orderBy = getSorting(query, "createdAt");
  const search = getSearch(query.searchTerm as string, [
    ...USER_SEARCHABLE_FIELDS,
  ]);
  const filters = buildFilters(query);

  // 2. Combine Search and Filters
  const where: Prisma.UserWhereInput = {
    AND: [filters, search],
  };

  // 3. Execute queries in parallel for better performance
  const [data, total] = await Promise.all([
    prismaInstance.user.findMany({
      where,
      skip,
      take,
      orderBy,
      omit: { password: true },
    }),
    prismaInstance.user.count({ where }),
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
