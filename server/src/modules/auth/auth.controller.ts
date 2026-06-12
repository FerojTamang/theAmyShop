import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getCurrentUser,
  loginUser,
  refreshAuthToken,
  registerUser,
} from "./auth.service.js";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "./auth.validation.js";

const validateBody = <T>(schema: ZodSchema<T>, body: unknown): T => {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(400, "Validation failed", error.issues);
    }

    throw error;
  }
};

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const payload = validateBody(registerSchema, req.body);
  const result = await registerUser(payload);

  res
    .status(201)
    .json(new ApiResponse(201, "Registration successful", result));
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const payload = validateBody(loginSchema, req.body);
  const result = await loginUser(payload);

  res.status(200).json(new ApiResponse(200, "Login successful", result));
});

export const me: RequestHandler = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.authUser!.id);

  res.status(200).json(new ApiResponse(200, "Current user fetched", { user }));
});

export const refreshToken: RequestHandler = asyncHandler(async (req, res) => {
  const payload = validateBody(refreshTokenSchema, req.body);
  const tokens = await refreshAuthToken(payload);

  res
    .status(200)
    .json(new ApiResponse(200, "Token refreshed successfully", { tokens }));
});

export const logout: RequestHandler = asyncHandler(async (_req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, "Logout successful", { loggedOut: true }));
});
