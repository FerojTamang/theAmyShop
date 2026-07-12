const DATABASE_UNAVAILABLE_PATTERNS = [
  /\bENOTFOUND\b/i,
  /\bECONNREFUSED\b/i,
  /\bETIMEDOUT\b/i,
  /\bP1001\b/i,
  /DriverAdapterError/i,
  /connection (?:was )?terminated/i,
  /tenant(?:\s+or\s+|\s*\/\s*)user(?:\s+was)?\s+not\s+found/i,
  /user(?:\s+or\s+|\s*\/\s*)tenant(?:\s+was)?\s+not\s+found/i,
] as const;

const collectErrorDetails = (
  error: unknown,
  seen = new Set<object>(),
  depth = 0,
): string[] => {
  if (depth > 5 || error === null || error === undefined) {
    return [];
  }

  if (typeof error === "string") {
    return [error];
  }

  if (typeof error !== "object") {
    return [String(error)];
  }

  if (seen.has(error)) {
    return [];
  }

  seen.add(error);

  const record = error as Record<string, unknown>;
  const details = [
    error.constructor?.name,
    typeof record.name === "string" ? record.name : undefined,
    typeof record.message === "string" ? record.message : undefined,
    typeof record.code === "string" ? record.code : undefined,
  ].filter((value): value is string => Boolean(value));

  for (const nestedKey of ["cause", "error", "originalError"] as const) {
    details.push(...collectErrorDetails(record[nestedKey], seen, depth + 1));
  }

  return details;
};

export const isDatabaseUnavailableError = (error: unknown): boolean => {
  const technicalDetails = collectErrorDetails(error).join(" ");

  return DATABASE_UNAVAILABLE_PATTERNS.some((pattern) =>
    pattern.test(technicalDetails),
  );
};

export const DATABASE_UNAVAILABLE_MESSAGE =
  "Database service is temporarily unavailable. Please try again in a few minutes.";
