import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  createProductHandler,
  deleteProductHandler,
  getProductBySlug,
  getProducts,
  updateProductHandler,
} from "./product.controller.js";

export const productRoutes = Router();
export const adminProductRoutes = Router();

productRoutes.get("/", getProducts);
productRoutes.get("/:slug", getProductBySlug);

adminProductRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);
adminProductRoutes.post("/", createProductHandler);
adminProductRoutes.patch("/:id", updateProductHandler);
adminProductRoutes.delete("/:id", deleteProductHandler);
