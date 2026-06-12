import type { RequestHandler } from "express";
import type { UserRole } from "../../generated/prisma/client.js";
import { ApiError } from "../utils/ApiError.js";

export const roleMiddleware =
  (...allowedRoles: UserRole[]): RequestHandler =>
  (req, _res, next): void => {
    if (!req.authUser) {
      next(new ApiError(401, "Authentication is required"));
      return;
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      next(new ApiError(403, "You do not have permission to access this route"));
      return;
    }

    next();
  };
