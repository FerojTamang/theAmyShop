import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createReview,
  getAdminReviewById,
  getMyReviewById,
  listAdminReviews,
  listMyReviews,
  listPublicProductReviews,
  softDeleteMyReview,
  updateAdminReviewStatus,
  updateMyReview,
} from "./review.service.js";
import {
  createReviewSchema,
  publicProductReviewQuerySchema,
  reviewQuerySchema,
  updateReviewSchema,
  updateReviewStatusSchema,
} from "./review.validation.js";

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

export const getPublicProductReviewsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(publicProductReviewQuerySchema, req.query);
    const result = await listPublicProductReviews(
      getStringParam(req.params.productId),
      query,
    );

    res.status(200).json(new ApiResponse(200, "Product reviews fetched", result));
  },
);

export const createReviewHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(createReviewSchema, req.body);
    const review = await createReview(req.authUser!.id, payload);

    res.status(201).json(new ApiResponse(201, "Review created", { review }));
  },
);

export const getMyReviewsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(reviewQuerySchema, req.query);
    const result = await listMyReviews(req.authUser!.id, query);

    res.status(200).json(new ApiResponse(200, "Reviews fetched", result));
  },
);

export const getMyReviewByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const review = await getMyReviewById(
      req.authUser!.id,
      getStringParam(req.params.id),
    );

    res.status(200).json(new ApiResponse(200, "Review fetched", { review }));
  },
);

export const updateMyReviewHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(updateReviewSchema, req.body);
    const review = await updateMyReview(
      req.authUser!.id,
      getStringParam(req.params.id),
      payload,
    );

    res.status(200).json(new ApiResponse(200, "Review updated", { review }));
  },
);

export const deleteMyReviewHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const review = await softDeleteMyReview(
      req.authUser!.id,
      getStringParam(req.params.id),
    );

    res.status(200).json(new ApiResponse(200, "Review deleted", { review }));
  },
);

export const getAdminReviewsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(reviewQuerySchema, req.query);
    const result = await listAdminReviews(query);

    res.status(200).json(new ApiResponse(200, "Reviews fetched", result));
  },
);

export const getAdminReviewByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const review = await getAdminReviewById(getStringParam(req.params.id));

    res.status(200).json(new ApiResponse(200, "Review fetched", { review }));
  },
);

export const updateAdminReviewStatusHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(updateReviewStatusSchema, req.body);
    const review = await updateAdminReviewStatus(
      getStringParam(req.params.id),
      payload,
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Review status updated", { review }));
  },
);
