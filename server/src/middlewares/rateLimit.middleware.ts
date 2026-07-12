import { rateLimit } from "express-rate-limit";

const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MESSAGE = "Too many attempts. Please try again later.";

const createAuthRateLimiter = (limit: number) =>
  rateLimit({
    windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
    limit,
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

export const loginRateLimiter = createAuthRateLimiter(5);
export const registerRateLimiter = createAuthRateLimiter(5);
export const refreshTokenRateLimiter = createAuthRateLimiter(30);
