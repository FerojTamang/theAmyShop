import type { CustomizationStatus } from "../../../generated/prisma/client.js";

export type CustomizationStatusValue = CustomizationStatus;

export type ReferenceImageInput = {
  imageUrl: string;
  publicId?: string;
};
