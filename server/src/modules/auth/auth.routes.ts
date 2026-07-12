import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  loginRateLimiter,
  refreshTokenRateLimiter,
  registerRateLimiter,
} from "../../middlewares/rateLimit.middleware.js";
import {
  login,
  logout,
  me,
  refreshToken,
  register,
} from "./auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/register", registerRateLimiter, register);
authRoutes.post("/login", loginRateLimiter, login);
authRoutes.get("/me", authMiddleware, me);
authRoutes.post("/refresh-token", refreshTokenRateLimiter, refreshToken);
authRoutes.post("/logout", authMiddleware, logout);
