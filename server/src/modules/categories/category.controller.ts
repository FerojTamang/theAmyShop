import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCategory,
  getPublicCategoryBySlug,
  listPublicCategories,
  softDeleteCategory,
  updateCategory,
} from "./category.service.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";

const validateBody = <T>(schema: ZodSchema<T>, body: unknown): T => {
  try {
    return schema.parse(body);
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

export const getCategories: RequestHandler = asyncHandler(async (_req, res) => {
  const categories = await listPublicCategories();

  res
    .status(200)
    .json(new ApiResponse(200, "Categories fetched", { categories }));
});

export const getCategoryBySlug: RequestHandler = asyncHandler(
  async (req, res) => {
    const category = await getPublicCategoryBySlug(
      getStringParam(req.params.slug),
    );

    res.status(200).json(new ApiResponse(200, "Category fetched", { category }));
  },
);

export const createCategoryHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validateBody(createCategorySchema, req.body);
    const category = await createCategory(payload);

    res
      .status(201)
      .json(new ApiResponse(201, "Category created", { category }));
  },
);

export const updateCategoryHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validateBody(updateCategorySchema, req.body);
    const category = await updateCategory(getStringParam(req.params.id), payload);

    res.status(200).json(new ApiResponse(200, "Category updated", { category }));
  },
);

export const deleteCategoryHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const category = await softDeleteCategory(getStringParam(req.params.id));

    res
      .status(200)
      .json(new ApiResponse(200, "Category deactivated", { category }));
  },
);
