import type { Request } from "express";
import { ApiError } from "../../utils/ApiError.js";

export const validateUploadedImage = (file: Request["file"]): Express.Multer.File => {
  if (!file) {
    throw new ApiError(400, "Image file is required");
  }

  return file;
};
