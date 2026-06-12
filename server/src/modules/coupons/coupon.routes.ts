import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  createCouponHandler,
  getCouponByIdHandler,
  getCouponsHandler,
  softDeleteCouponHandler,
  updateCouponHandler,
  validateCouponHandler,
} from "./coupon.controller.js";

export const couponRoutes = Router();
export const adminCouponRoutes = Router();

couponRoutes.post("/validate", validateCouponHandler);

adminCouponRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);

adminCouponRoutes.post("/", createCouponHandler);
adminCouponRoutes.get("/", getCouponsHandler);
adminCouponRoutes.get("/:id", getCouponByIdHandler);
adminCouponRoutes.patch("/:id", updateCouponHandler);
adminCouponRoutes.delete("/:id", softDeleteCouponHandler);
