import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  adjustRewardWalletHandler,
  getAdminRewardTransactionsHandler,
  getAdminRewardWalletByUserIdHandler,
  getAdminRewardWalletsHandler,
  getMyRewardTransactionsHandler,
  getMyRewardWalletHandler,
} from "./reward.controller.js";

export const rewardRoutes = Router();
export const adminRewardRoutes = Router();

rewardRoutes.use(authMiddleware);
rewardRoutes.get("/wallet", getMyRewardWalletHandler);
rewardRoutes.get("/transactions", getMyRewardTransactionsHandler);

adminRewardRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);

adminRewardRoutes.get("/wallets", getAdminRewardWalletsHandler);
adminRewardRoutes.get("/wallets/:userId", getAdminRewardWalletByUserIdHandler);
adminRewardRoutes.get("/transactions", getAdminRewardTransactionsHandler);
adminRewardRoutes.post("/adjust", adjustRewardWalletHandler);
