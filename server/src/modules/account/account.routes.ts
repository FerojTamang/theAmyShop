import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  changeMyPasswordHandler,
  getMyAccountProfileHandler,
  updateMyAccountProfileHandler,
} from "./account.controller.js";

export const accountRoutes = Router();

accountRoutes.use(authMiddleware);
accountRoutes.get("/profile", getMyAccountProfileHandler);
accountRoutes.patch("/profile", updateMyAccountProfileHandler);
accountRoutes.patch("/change-password", changeMyPasswordHandler);
