import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { uploadSingleImage } from "../../middlewares/upload.middleware.js";
import {
  uploadCustomizationReferenceHandler,
  uploadProductImageHandler,
} from "./upload.controller.js";

export const uploadRoutes = Router();
export const adminUploadRoutes = Router();

uploadRoutes.use(authMiddleware);
uploadRoutes.post(
  "/customization-reference",
  uploadSingleImage,
  uploadCustomizationReferenceHandler,
);

adminUploadRoutes.use(
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN),
);
adminUploadRoutes.post("/product-image", uploadSingleImage, uploadProductImageHandler);
