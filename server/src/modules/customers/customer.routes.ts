import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  getAdminCustomerByIdHandler,
  getAdminCustomersHandler,
  updateAdminCustomerStatusHandler,
} from "./customer.controller.js";

export const adminCustomerRoutes = Router();

adminCustomerRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);

adminCustomerRoutes.get("/", getAdminCustomersHandler);
adminCustomerRoutes.get("/:id", getAdminCustomerByIdHandler);
adminCustomerRoutes.patch("/:id/status", updateAdminCustomerStatusHandler);
