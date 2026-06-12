import type { RequestHandler } from "express";
import { AccountStatus } from "../../generated/prisma/client.js";
import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication token is required");
    }

    const token = authorizationHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new ApiError(401, "Authenticated user no longer exists");
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new ApiError(403, "Account is not active");
    }

    req.authUser = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
