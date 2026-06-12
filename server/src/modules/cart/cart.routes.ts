import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  addCartItemHandler,
  clearCartHandler,
  getCartHandler,
  removeCartItemHandler,
  updateCartItemHandler,
} from "./cart.controller.js";

export const cartRoutes = Router();

cartRoutes.use(authMiddleware);

cartRoutes.get("/", getCartHandler);
cartRoutes.post("/items", addCartItemHandler);
cartRoutes.patch("/items/:id", updateCartItemHandler);
cartRoutes.delete("/items/:id", removeCartItemHandler);
cartRoutes.delete("/", clearCartHandler);
