import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  getAdminPaymentByIdHandler,
  getAdminPaymentsHandler,
  getMyPaymentByIdHandler,
  getMyPaymentsHandler,
  onlinePaymentUnavailableHandler,
  updateAdminPaymentStatusHandler,
} from "./payment.controller.js";

export const paymentRoutes = Router();
export const adminPaymentRoutes = Router();

paymentRoutes.use(authMiddleware);
paymentRoutes.get("/my", getMyPaymentsHandler);
paymentRoutes.get("/:id", getMyPaymentByIdHandler);
paymentRoutes.post("/khalti/initiate", onlinePaymentUnavailableHandler);
paymentRoutes.post("/khalti/verify", onlinePaymentUnavailableHandler);
paymentRoutes.post("/esewa/initiate", onlinePaymentUnavailableHandler);
paymentRoutes.post("/esewa/verify", onlinePaymentUnavailableHandler);

adminPaymentRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);

adminPaymentRoutes.get("/", getAdminPaymentsHandler);
adminPaymentRoutes.get("/:id", getAdminPaymentByIdHandler);
adminPaymentRoutes.patch("/:id/status", updateAdminPaymentStatusHandler);
