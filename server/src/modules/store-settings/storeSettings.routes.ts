import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  getStoreSettingsHandler,
  updateStoreSettingsHandler,
} from "./storeSettings.controller.js";

export const storeSettingsRoutes = Router();
export const adminStoreSettingsRoutes = Router();

storeSettingsRoutes.get("/", getStoreSettingsHandler);

adminStoreSettingsRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);
adminStoreSettingsRoutes.get("/", getStoreSettingsHandler);
adminStoreSettingsRoutes.patch("/", updateStoreSettingsHandler);
