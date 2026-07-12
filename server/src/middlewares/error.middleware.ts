import type { ErrorRequestHandler } from "express";
import { config } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import {
  DATABASE_UNAVAILABLE_MESSAGE,
  isDatabaseUnavailableError,
} from "../utils/databaseError.js";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (isDatabaseUnavailableError(error)) {
    console.error("Database connection error", error);

    res.status(503).json({
      success: false,
      statusCode: 503,
      message: DATABASE_UNAVAILABLE_MESSAGE,
      errors: [],
    });
    return;
  }

  const statusCode =
    error instanceof ApiError && error.statusCode ? error.statusCode : 500;
  const message =
    error instanceof ApiError ? error.message : "Internal server error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: error instanceof ApiError ? error.errors : [],
    ...(config.NODE_ENV !== "production" && { stack: error.stack }),
  });
};
