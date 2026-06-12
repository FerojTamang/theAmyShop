import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { config } from "../config/env.js";
import { ApiError } from "./ApiError.js";
import type { AuthPayload, AuthTokens } from "../modules/auth/auth.types.js";

const ACCESS_TOKEN_EXPIRES_IN: SignOptions["expiresIn"] = "15m";
const REFRESH_TOKEN_EXPIRES_IN: SignOptions["expiresIn"] = "7d";

const signToken = (
  payload: AuthPayload,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
): string => {
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token: string, secret: string): AuthPayload => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (
      typeof decoded.userId !== "string" ||
      typeof decoded.role !== "string"
    ) {
      throw new ApiError(401, "Invalid token payload");
    }

    return {
      userId: decoded.userId,
      role: decoded.role as AuthPayload["role"],
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, "Invalid or expired token");
  }
};

export const generateAuthTokens = (payload: AuthPayload): AuthTokens => {
  return {
    accessToken: signToken(
      payload,
      config.JWT_ACCESS_SECRET,
      ACCESS_TOKEN_EXPIRES_IN,
    ),
    refreshToken: signToken(
      payload,
      config.JWT_REFRESH_SECRET,
      REFRESH_TOKEN_EXPIRES_IN,
    ),
  };
};

export const verifyAccessToken = (token: string): AuthPayload => {
  return verifyToken(token, config.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  return verifyToken(token, config.JWT_REFRESH_SECRET);
};
