import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const requireInProduction = (
  value: string | undefined,
  name: string,
  developmentFallback: string,
): string => {
  if (value) {
    return value;
  }

  if (isProduction) {
    throw new Error(`${name} is required in production`);
  }

  return developmentFallback;
};

const parsePort = (value: string | undefined): number => {
  const parsedPort = Number(value);

  if (Number.isInteger(parsedPort) && parsedPort > 0) {
    return parsedPort;
  }

  return 5000;
};

export const config = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parsePort(process.env.PORT),
  DATABASE_URL: requireInProduction(
    process.env.DATABASE_URL,
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/the_amy_shop?schema=public",
  ),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
  CORS_ORIGIN:
    process.env.CORS_ORIGIN ??
    process.env.FRONTEND_URL ??
    "http://localhost:5173",
  JWT_ACCESS_SECRET: requireInProduction(
    process.env.JWT_ACCESS_SECRET,
    "JWT_ACCESS_SECRET",
    "development-access-secret-change-me",
  ),
  JWT_REFRESH_SECRET: requireInProduction(
    process.env.JWT_REFRESH_SECRET,
    "JWT_REFRESH_SECRET",
    "development-refresh-secret-change-me",
  ),
} as const;
