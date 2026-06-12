import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createCheckoutOrder } from "./checkout.service.js";
import { checkoutSchema } from "./checkout.validation.js";

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

export const createCheckoutOrderHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(checkoutSchema, req.body);
    const order = await createCheckoutOrder(req.authUser!.id, payload);

    res.status(201).json(new ApiResponse(201, "Order created", { order }));
  },
);
