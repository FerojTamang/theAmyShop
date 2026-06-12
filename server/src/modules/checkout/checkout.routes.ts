import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { createCheckoutOrderHandler } from "./checkout.controller.js";

export const checkoutRoutes = Router();

checkoutRoutes.use(authMiddleware);

checkoutRoutes.post("/", createCheckoutOrderHandler);
