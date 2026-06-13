import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  changeMyPassword,
  getMyAccountProfile,
  updateMyAccountProfile,
} from "./account.service.js";
import {
  changePasswordSchema,
  updateAccountProfileSchema,
} from "./account.validation.js";

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

export const getMyAccountProfileHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const profile = await getMyAccountProfile(req.authUser!.id);

    res
      .status(200)
      .json(new ApiResponse(200, "Account profile fetched", { profile }));
  },
);

export const updateMyAccountProfileHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(updateAccountProfileSchema, req.body);
    const profile = await updateMyAccountProfile(req.authUser!.id, payload);

    res
      .status(200)
      .json(new ApiResponse(200, "Account profile updated", { profile }));
  },
);

export const changeMyPasswordHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(changePasswordSchema, req.body);
    await changeMyPassword(req.authUser!.id, payload);

    res.status(200).json(new ApiResponse(200, "Password changed"));
  },
);
