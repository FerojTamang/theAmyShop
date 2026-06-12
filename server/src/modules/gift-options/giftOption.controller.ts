import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getGiftOptionById,
  listGiftOptions,
  updateGiftOptionPrintStatus,
} from "./giftOption.service.js";
import {
  giftOptionQuerySchema,
  updateGiftPrintStatusSchema,
} from "./giftOption.validation.js";

const validate = <T>(schema: ZodSchema<T>, value: unknown): T => {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(400, "Validation failed", error.issues);
    }

    throw error;
  }
};

const getStringParam = (value: string | string[] | undefined): string => {
  if (typeof value !== "string") {
    throw new ApiError(400, "Invalid route parameter");
  }

  return value;
};

export const getGiftOptionsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(giftOptionQuerySchema, req.query);
    const result = await listGiftOptions(query);

    res.status(200).json(new ApiResponse(200, "Gift options fetched", result));
  },
);

export const getGiftOptionByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const giftOption = await getGiftOptionById(getStringParam(req.params.id));

    res
      .status(200)
      .json(new ApiResponse(200, "Gift option fetched", { giftOption }));
  },
);

export const updateGiftPrintStatusHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(updateGiftPrintStatusSchema, req.body);
    const giftOption = await updateGiftOptionPrintStatus(
      getStringParam(req.params.id),
      payload,
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Gift print status updated", { giftOption }));
  },
);
