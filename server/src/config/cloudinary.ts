import { v2 as cloudinary } from "cloudinary";
import { config } from "./env.js";

const placeholderValues = new Set([
  "your_cloud_name",
  "your_api_key",
  "your_api_secret",
]);

const hasRealCloudinaryValue = (value: string): boolean => {
  const normalizedValue = value.trim().toLowerCase();

  return Boolean(normalizedValue) && !placeholderValues.has(normalizedValue);
};

export const isCloudinaryConfigured = (): boolean => {
  return (
    hasRealCloudinaryValue(config.CLOUDINARY_CLOUD_NAME) &&
    hasRealCloudinaryValue(config.CLOUDINARY_API_KEY) &&
    hasRealCloudinaryValue(config.CLOUDINARY_API_SECRET)
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
