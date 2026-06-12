import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  getAdminPaymentByIdHandler,
  getAdminPaymentsHandler,
  getMyPaymentByIdHandler,
  getMyPaymentsHandler,
  initiateEsewaPaymentHandler,
  initiateKhaltiPaymentHandler,
  updateAdminPaymentStatusHandler,
  verifyEsewaPaymentHandler,
  verifyKhaltiPaymentHandler,
} from "./payment.controller.js";

export const paymentRoutes = Router();
export const adminPaymentRoutes = Router();

paymentRoutes.use(authMiddleware);
paymentRoutes.get("/my", getMyPaymentsHandler);
paymentRoutes.get("/:id", getMyPaymentByIdHandler);
paymentRoutes.post("/khalti/initiate", initiateKhaltiPaymentHandler);
paymentRoutes.post("/khalti/verify", verifyKhaltiPaymentHandler);
paymentRoutes.post("/esewa/initiate", initiateEsewaPaymentHandler);
paymentRoutes.post("/esewa/verify", verifyEsewaPaymentHandler);

adminPaymentRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);

adminPaymentRoutes.get("/", getAdminPaymentsHandler);
adminPaymentRoutes.get("/:id", getAdminPaymentByIdHandler);
adminPaymentRoutes.patch("/:id/status", updateAdminPaymentStatusHandler);
