/**
 * Calculates pagination offsets (skip and take) from a query object.
 * Defaults to page 1 and a limit of 10 if not provided.
 */
export const getPagination = (query: Record<string, any>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  return { skip, take: limit, page };
};

/**
 * Parses a sort string (e.g., "-createdAt" or "name") into a Prisma-compatible object.
 * A leading "-" indicates descending order.
 */
export const getSorting = (
  query: Record<string, any>,
  defaultSort = "createdAt",
) => {
  const sort = (query.sort as string) || `-${defaultSort}`;
  const [field, order] = sort.startsWith("-")
    ? [sort.substring(1), "desc"]
    : [sort, "asc"];

  return { [field]: order };
};

/**
 * Generates a Prisma 'OR' filter for case-insensitive partial string matching.
 * Used for general search bars across multiple fields (e.g., name, email).
 */
export const getSearch = (searchTerm: string | undefined, fields: string[]) => {
  if (!searchTerm) return {};
  return {
    OR: fields.map((field) => ({
      [field]: { contains: searchTerm, mode: "insensitive" as const },
    })),
  };
};

/**
 * Converts raw query parameters into Prisma-compatible filters.
 * Handles type conversion for booleans, numbers, and comma-separated lists (IN queries).
 */
export const buildFilters = (
  query: Record<string, any>,
  excludeFields: string[] = [],
) => {
  const filterObj = { ...query };
  const internalExclusions = ["page", "limit", "sort", "searchTerm", "fields", ...excludeFields];

  internalExclusions.forEach((key) => delete filterObj[key]);

  const finalFilters: Record<string, any> = {};

  for (const [key, value] of Object.entries(filterObj)) {
    if (value === undefined || value === null || value === "") continue;

    if (typeof value === "string" && value.includes(",")) {
      finalFilters[key] = { in: value.split(",").map((v) => v.trim()) };
      continue;
    }

    if (typeof value === "string" && value.trim() !== "" && !isNaN(Number(value))) {
      finalFilters[key] = Number(value);
      continue;
    }

    if (value === "true" || value === "false") {
      finalFilters[key] = value === "true";
      continue;
    }

    finalFilters[key] = value;
  }

  return finalFilters;
};