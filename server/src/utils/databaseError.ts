const DATABASE_UNAVAILABLE_PATTERNS = [
  /\bENOTFOUND\b/i,
  /\bECONNREFUSED\b/i,
  /\bETIMEDOUT\b/i,
  /\bEAI_AGAIN\b/i,
  /\bP1001\b/i,
  /DriverAdapterError/i,
  /PrismaPgAdapter/i,
  /connection (?:was )?terminated/i,
  /connection refused/i,
  /getaddrinfo/i,
  /failed to connect/i,
  /database server/i,
  /can(?:not|'t) reach (?:the )?database server/i,
  /tenant(?:\s+or\s+|\s*\/\s*)user(?:\s+was)?\s+not\s+found/i,
  /user(?:\s+or\s+|\s*\/\s*)tenant(?:\s+was)?\s+not\s+found/i,
  /tenant(?:\s+or\s+|\s*\/\s*)user[^\r\n]*postgres/i,
  /user(?:\s+or\s+|\s*\/\s*)tenant[^\r\n]*postgres/i,
] as const;

const COMMON_ERROR_KEYS = [
  "name",
  "message",
  "code",
  "stack",
  "cause",
  "error",
  "originalError",
] as const;

const MAX_ERROR_DEPTH = 8;
const MAX_VISITED_OBJECTS = 100;

const getOwnPropertyNamesSafely = (value: object): string[] => {
  try {
    return Object.getOwnPropertyNames(value);
  } catch {
    return [];
  }
};

const getDataPropertySafely = (
  value: object,
  key: string,
): unknown => {
  let current: object | null = value;

  while (current) {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(current, key);
      if (descriptor) {
        return "value" in descriptor ? descriptor.value : undefined;
      }
      current = Object.getPrototypeOf(current) as object | null;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

const collectErrorDetails = (
  error: unknown,
  seen = new Set<object>(),
  depth = 0,
): string[] => {
  if (
    depth > MAX_ERROR_DEPTH ||
    seen.size >= MAX_VISITED_OBJECTS ||
    error === null ||
    error === undefined
  ) {
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

  const constructor = getDataPropertySafely(error, "constructor");
  const constructorName =
    typeof constructor === "function" ? constructor.name : undefined;
  const details = constructorName ? [constructorName] : [];
  const keys = new Set([
    ...COMMON_ERROR_KEYS,
    ...getOwnPropertyNamesSafely(error),
  ]);

  for (const key of keys) {
    const value = getDataPropertySafely(error, key);
    if (typeof value === "string") {
      details.push(value);
    } else if (value !== null && typeof value === "object") {
      details.push(...collectErrorDetails(value, seen, depth + 1));
    }
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
