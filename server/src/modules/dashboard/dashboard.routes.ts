import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  getDashboardSummaryHandler,
  getLowStockProductsHandler,
  getOrderStatusSummaryHandler,
  getPaymentStatusSummaryHandler,
  getRecentOrdersHandler,
  getReviewSummaryHandler,
  getSalesOverviewHandler,
} from "./dashboard.controller.js";

export const adminDashboardRoutes = Router();

adminDashboardRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);

adminDashboardRoutes.get("/summary", getDashboardSummaryHandler);
adminDashboardRoutes.get("/recent-orders", getRecentOrdersHandler);
adminDashboardRoutes.get("/low-stock-products", getLowStockProductsHandler);
adminDashboardRoutes.get("/sales-overview", getSalesOverviewHandler);
adminDashboardRoutes.get("/order-status-summary", getOrderStatusSummaryHandler);
adminDashboardRoutes.get(
  "/payment-status-summary",
  getPaymentStatusSummaryHandler,
);
adminDashboardRoutes.get("/review-summary", getReviewSummaryHandler);
