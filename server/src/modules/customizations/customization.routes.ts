import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  createCustomizationHandler,
  getAdminCustomizationByIdHandler,
  getAdminCustomizationsHandler,
  getMyCustomizationByIdHandler,
  getMyCustomizationsHandler,
  updateCustomizationStatusHandler,
} from "./customization.controller.js";

export const customizationRoutes = Router();
export const adminCustomizationRoutes = Router();

customizationRoutes.use(authMiddleware);
customizationRoutes.post("/", createCustomizationHandler);
customizationRoutes.get("/my", getMyCustomizationsHandler);
customizationRoutes.get("/:id", getMyCustomizationByIdHandler);

adminCustomizationRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);
adminCustomizationRoutes.get("/", getAdminCustomizationsHandler);
adminCustomizationRoutes.get("/:id", getAdminCustomizationByIdHandler);
adminCustomizationRoutes.patch("/:id/status", updateCustomizationStatusHandler);
