import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  getGiftOptionByIdHandler,
  getGiftOptionsHandler,
  updateGiftPrintStatusHandler,
} from "./giftOption.controller.js";

export const adminGiftOptionRoutes = Router();

adminGiftOptionRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);

adminGiftOptionRoutes.get("/", getGiftOptionsHandler);
adminGiftOptionRoutes.get("/:id", getGiftOptionByIdHandler);
adminGiftOptionRoutes.patch("/:id/print-status", updateGiftPrintStatusHandler);
