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

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number(value);

  if (Number.isInteger(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return fallback;
};

const DEVELOPMENT_CORS_ORIGINS =
  "http://localhost:5173,http://127.0.0.1:5173";

const parseCorsOrigins = (value: string): string[] => {
  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error("CORS_ORIGIN must include at least one allowed origin");
  }

  return origins;
};

const corsOriginValue = requireInProduction(
  process.env.CORS_ORIGIN,
  "CORS_ORIGIN",
  DEVELOPMENT_CORS_ORIGINS,
);

export const config = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parsePort(process.env.PORT),
  AUTH_LOGIN_RATE_LIMIT_WINDOW_MINUTES: parsePositiveInteger(
    process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MINUTES,
    5,
  ),
  AUTH_LOGIN_RATE_LIMIT_MAX: parsePositiveInteger(
    process.env.AUTH_LOGIN_RATE_LIMIT_MAX,
    isProduction ? 10 : 20,
  ),
  DATABASE_URL: requireInProduction(
    process.env.DATABASE_URL,
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/the_amy_shop?schema=public",
  ),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
  CORS_ORIGINS: parseCorsOrigins(corsOriginValue),
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
  KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY ?? "",
  KHALTI_PUBLIC_KEY: process.env.KHALTI_PUBLIC_KEY ?? "",
  KHALTI_BASE_URL: process.env.KHALTI_BASE_URL ?? "",
  ESEWA_MERCHANT_CODE: process.env.ESEWA_MERCHANT_CODE ?? "",
  ESEWA_SECRET_KEY: process.env.ESEWA_SECRET_KEY ?? "",
  ESEWA_BASE_URL: process.env.ESEWA_BASE_URL ?? "",
  PAYMENT_SUCCESS_URL:
    process.env.PAYMENT_SUCCESS_URL ?? "http://localhost:5173/payment/success",
  PAYMENT_FAILURE_URL:
    process.env.PAYMENT_FAILURE_URL ?? "http://localhost:5173/payment/failure",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",
  CLOUDINARY_PRODUCT_FOLDER:
    process.env.CLOUDINARY_PRODUCT_FOLDER ?? "the-amy-shop/products",
} as const;
