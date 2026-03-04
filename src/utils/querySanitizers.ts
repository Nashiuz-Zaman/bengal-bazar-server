// Define the operators Prisma uses that a user might try to inject
const prismaOperators = [
  "contains",
  "startsWith",
  "endsWith",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "notIn",
  "not",
  "mode", // used for case-insensitivity
];

/**
 * Ensures a specific field in the query object is set to a hardcoded value,
 * stripping away any potentially injected filter objects.
 */
export const lockQueryField = <T>(
  query: Record<string, any>,
  field: keyof T & string,
  value: any,
) => {
  // Directly set the value. This replaces { email: { contains: '...' } }
  // with { email: 'actual-value' }
  query[field] = value;

  // Cleanup: In Prisma, if the value was an object, we want to make sure
  // it doesn't contain operator keys.
  if (typeof query[field] === "object" && query[field] !== null) {
    prismaOperators.forEach((op) => {
      if (query[field][op] !== undefined) {
        delete query[field][op];
      }
    });
  }

  return query;
};

export const sanitizeLimitFields = <T>(
  limitFields: string,
  forbidden: (keyof T)[],
) => {
  if (!limitFields) return undefined;

  const forbiddenSet = new Set<string>(forbidden as string[]);

  const cleaned = limitFields
    .split(",")
    .map((f) => f.trim())
    .filter((f) => f && !forbiddenSet.has(f));

  return cleaned.length ? cleaned.join(",") : undefined;
};
