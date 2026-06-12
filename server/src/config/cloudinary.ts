import { v2 as cloudinary } from "cloudinary";
import { config } from "./env.js";

export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    config.CLOUDINARY_CLOUD_NAME &&
      config.CLOUDINARY_API_KEY &&
      config.CLOUDINARY_API_SECRET,
  );
};

export const configureCloudinary = (): void => {
  if (!isCloudinaryConfigured()) {
    return;
  }

  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

configureCloudinary();

export { cloudinary };
