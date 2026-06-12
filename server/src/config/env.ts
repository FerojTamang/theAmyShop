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
} as const;
