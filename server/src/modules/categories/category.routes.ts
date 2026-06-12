import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategories,
  getCategoryBySlug,
  updateCategoryHandler,
} from "./category.controller.js";

export const categoryRoutes = Router();
export const adminCategoryRoutes = Router();

categoryRoutes.get("/", getCategories);
categoryRoutes.get("/:slug", getCategoryBySlug);

adminCategoryRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);
adminCategoryRoutes.post("/", createCategoryHandler);
adminCategoryRoutes.patch("/:id", updateCategoryHandler);
adminCategoryRoutes.delete("/:id", deleteCategoryHandler);
