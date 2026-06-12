import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  getAdminOrderByIdHandler,
  getAdminOrdersHandler,
  getMyOrderByIdHandler,
  getMyOrdersHandler,
  updateAdminOrderStatusHandler,
} from "./order.controller.js";

export const orderRoutes = Router();
export const adminOrderRoutes = Router();

orderRoutes.use(authMiddleware);
orderRoutes.get("/my", getMyOrdersHandler);
orderRoutes.get("/:id", getMyOrderByIdHandler);

adminOrderRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);

adminOrderRoutes.get("/", getAdminOrdersHandler);
adminOrderRoutes.get("/:id", getAdminOrderByIdHandler);
adminOrderRoutes.patch("/:id/status", updateAdminOrderStatusHandler);
