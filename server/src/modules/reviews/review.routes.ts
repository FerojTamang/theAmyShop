import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  createReviewHandler,
  deleteMyReviewHandler,
  getAdminReviewByIdHandler,
  getAdminReviewsHandler,
  getMyReviewByIdHandler,
  getMyReviewsHandler,
  getPublicProductReviewsHandler,
  updateAdminReviewStatusHandler,
  updateMyReviewHandler,
} from "./review.controller.js";

export const publicProductReviewRoutes = Router({ mergeParams: true });
export const reviewRoutes = Router();
export const adminReviewRoutes = Router();

publicProductReviewRoutes.get("/", getPublicProductReviewsHandler);

reviewRoutes.use(authMiddleware);
reviewRoutes.post("/", createReviewHandler);
reviewRoutes.get("/my", getMyReviewsHandler);
reviewRoutes.get("/:id", getMyReviewByIdHandler);
reviewRoutes.patch("/:id", updateMyReviewHandler);
reviewRoutes.delete("/:id", deleteMyReviewHandler);

adminReviewRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);

adminReviewRoutes.get("/", getAdminReviewsHandler);
adminReviewRoutes.get("/:id", getAdminReviewByIdHandler);
adminReviewRoutes.patch("/:id/status", updateAdminReviewStatusHandler);
