import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  applyReferralCode,
  getOrCreateMyReferralCode,
  listAdminReferrals,
  listMyReferrals,
  updateAdminReferralStatus,
} from "./referral.service.js";
import {
  applyReferralSchema,
  referralQuerySchema,
  updateReferralStatusSchema,
} from "./referral.validation.js";

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

export const getMyReferralCodeHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const referralCode = await getOrCreateMyReferralCode(req.authUser!.id);

    res
      .status(200)
      .json(new ApiResponse(200, "Referral code fetched", { referralCode }));
  },
);

export const applyReferralCodeHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(applyReferralSchema, req.body);
    const referral = await applyReferralCode(req.authUser!.id, payload);

    res
      .status(201)
      .json(new ApiResponse(201, "Referral code applied", { referral }));
  },
);

export const getMyReferralsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(referralQuerySchema, req.query);
    const result = await listMyReferrals(req.authUser!.id, query);

    res.status(200).json(new ApiResponse(200, "Referrals fetched", result));
  },
);

export const getAdminReferralsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(referralQuerySchema, req.query);
    const result = await listAdminReferrals(query);

    res.status(200).json(new ApiResponse(200, "Referrals fetched", result));
  },
);

export const updateAdminReferralStatusHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(updateReferralStatusSchema, req.body);
    const referral = await updateAdminReferralStatus(
      getStringParam(req.params.id),
      payload,
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Referral status updated", { referral }));
  },
);
