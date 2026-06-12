import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  login,
  logout,
  me,
  refreshToken,
  register,
} from "./auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", authMiddleware, me);
authRoutes.post("/refresh-token", refreshToken);
authRoutes.post("/logout", authMiddleware, logout);
