import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCoupon,
  getCouponById,
  listCoupons,
  softDeleteCoupon,
  updateCoupon,
  validateCouponPreview,
} from "./coupon.service.js";
import {
  couponQuerySchema,
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from "./coupon.validation.js";

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

export const createCouponHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(createCouponSchema, req.body);
    const coupon = await createCoupon(payload);

    res
      .status(201)
      .json(new ApiResponse(201, "Coupon created", { coupon }));
  },
);

export const getCouponsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(couponQuerySchema, req.query);
    const result = await listCoupons(query);

    res.status(200).json(new ApiResponse(200, "Coupons fetched", result));
  },
);

export const getCouponByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const coupon = await getCouponById(getStringParam(req.params.id));

    res.status(200).json(new ApiResponse(200, "Coupon fetched", { coupon }));
  },
);

export const updateCouponHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(updateCouponSchema, req.body);
    const coupon = await updateCoupon(getStringParam(req.params.id), payload);

    res.status(200).json(new ApiResponse(200, "Coupon updated", { coupon }));
  },
);

export const softDeleteCouponHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const coupon = await softDeleteCoupon(getStringParam(req.params.id));

    res
      .status(200)
      .json(new ApiResponse(200, "Coupon deactivated", { coupon }));
  },
);

export const validateCouponHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(validateCouponSchema, req.body);
    const result = await validateCouponPreview(payload);

    res
      .status(200)
      .json(new ApiResponse(200, "Coupon validation preview complete", result));
  },
);
