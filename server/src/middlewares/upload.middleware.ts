import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const maxImageSizeInBytes = 5 * 1024 * 1024;
const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const storage = multer.memoryStorage();

export const uploadSingleImage = multer({
  storage,
  limits: {
    fileSize: maxImageSizeInBytes,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageMimeTypes.has(file.mimetype)) {
      callback(
        new ApiError(
          400,
          "Invalid image type. Please upload JPG, PNG, or WEBP.",
        ),
      );
      return;
    }

    callback(null, true);
  },
}).single("image");
