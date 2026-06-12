import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./cart.service.js";
import {
  addCartItemSchema,
  updateCartItemSchema,
} from "./cart.validation.js";

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

export const getCartHandler: RequestHandler = asyncHandler(async (req, res) => {
  const result = await getCart(req.authUser!.id);

  res.status(200).json(new ApiResponse(200, "Cart fetched", result));
});

export const addCartItemHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validateBody(addCartItemSchema, req.body);
    const result = await addCartItem(req.authUser!.id, payload);

    res.status(200).json(new ApiResponse(200, "Cart item added", result));
  },
);

export const updateCartItemHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validateBody(updateCartItemSchema, req.body);
    const result = await updateCartItem(
      req.authUser!.id,
      getStringParam(req.params.id),
      payload,
    );

    res.status(200).json(new ApiResponse(200, "Cart item updated", result));
  },
);

export const removeCartItemHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const result = await removeCartItem(
      req.authUser!.id,
      getStringParam(req.params.id),
    );

    res.status(200).json(new ApiResponse(200, "Cart item removed", result));
  },
);

export const clearCartHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const result = await clearCart(req.authUser!.id);

    res.status(200).json(new ApiResponse(200, "Cart cleared", result));
  },
);
