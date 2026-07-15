import type { RequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getPublicStoreSettings,
  updateStoreSettings,
} from "./storeSettings.service.js";
import { updateStoreSettingsSchema } from "./storeSettings.validation.js";

export const getStoreSettingsHandler: RequestHandler = asyncHandler(async (_req, res) => {
  const settings = await getPublicStoreSettings();
  res.status(200).json(new ApiResponse(200, "Store settings fetched", { settings }));
});

export const updateStoreSettingsHandler: RequestHandler = asyncHandler(async (req, res) => {
  try {
    const input = updateStoreSettingsSchema.parse(req.body);
    const settings = await updateStoreSettings(input);
    res.status(200).json(new ApiResponse(200, "Store settings updated", { settings }));
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(400, "Validation failed", error.issues);
    }
    throw error;
  }
});
