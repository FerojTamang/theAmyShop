import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  applyReferralCodeHandler,
  getAdminReferralsHandler,
  getMyReferralCodeHandler,
  getMyReferralsHandler,
  updateAdminReferralStatusHandler,
} from "./referral.controller.js";

export const referralRoutes = Router();
export const adminReferralRoutes = Router();

referralRoutes.use(authMiddleware);
referralRoutes.get("/code", getMyReferralCodeHandler);
referralRoutes.post("/apply", applyReferralCodeHandler);
referralRoutes.get("/my", getMyReferralsHandler);

adminReferralRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);

adminReferralRoutes.get("/", getAdminReferralsHandler);
adminReferralRoutes.patch("/:id/status", updateAdminReferralStatusHandler);
