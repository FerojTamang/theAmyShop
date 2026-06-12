import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createProduct,
  getPublicProductBySlug,
  listPublicProducts,
  softDeleteProduct,
  updateProduct,
} from "./product.service.js";
import {
  createProductSchema,
  productQuerySchema,
  updateProductSchema,
} from "./product.validation.js";

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

export const getProducts: RequestHandler = asyncHandler(async (req, res) => {
  const query = validate(productQuerySchema, req.query);
  const result = await listPublicProducts(query);

  res.status(200).json(new ApiResponse(200, "Products fetched", result));
});

export const getProductBySlug: RequestHandler = asyncHandler(
  async (req, res) => {
    const product = await getPublicProductBySlug(getStringParam(req.params.slug));

    res.status(200).json(new ApiResponse(200, "Product fetched", { product }));
  },
);

export const createProductHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(createProductSchema, req.body);
    const product = await createProduct(payload);

    res.status(201).json(new ApiResponse(201, "Product created", { product }));
  },
);

export const updateProductHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(updateProductSchema, req.body);
    const product = await updateProduct(getStringParam(req.params.id), payload);

    res.status(200).json(new ApiResponse(200, "Product updated", { product }));
  },
);

export const deleteProductHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const product = await softDeleteProduct(getStringParam(req.params.id));

    res
      .status(200)
      .json(new ApiResponse(200, "Product deactivated", { product }));
  },
);
