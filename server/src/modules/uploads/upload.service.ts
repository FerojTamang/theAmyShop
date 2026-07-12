import type { UploadApiResponse } from "cloudinary";
import { cloudinary, isCloudinaryConfigured } from "../../config/cloudinary.js";
import { ApiError } from "../../utils/ApiError.js";
import type { UploadedImageResult, UploadFolder } from "./upload.types.js";

const uploadNotConfiguredMessage =
  "Cloudinary is not configured. Add real CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET values to server/.env, then restart the backend.";

const uploadBufferToCloudinary = async (
  file: Express.Multer.File,
  folder: UploadFolder,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new ApiError(500, "Image upload failed"));
          return;
        }

        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

export const uploadImage = async (
  file: Express.Multer.File,
  folder: UploadFolder,
): Promise<UploadedImageResult> => {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(503, uploadNotConfiguredMessage);
  }

  const result = await uploadBufferToCloudinary(file, folder);

  return {
    imageUrl: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
};
