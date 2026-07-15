import { rateLimit } from "express-rate-limit";
import { config } from "../config/env.js";

const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MESSAGE = "Too many attempts. Please try again later.";

const createAuthRateLimiter = (
  limit: number,
  windowMs = AUTH_RATE_LIMIT_WINDOW_MS,
  skipSuccessfulRequests = false,
) =>
  rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        statusCode: 429,
        message: RATE_LIMIT_MESSAGE,
        errors: [],
      });
    },
  });

export const loginRateLimiter = createAuthRateLimiter(
  config.AUTH_LOGIN_RATE_LIMIT_MAX,
  config.AUTH_LOGIN_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  true,
);
export const registerRateLimiter = createAuthRateLimiter(5);
export const refreshTokenRateLimiter = createAuthRateLimiter(30);
