import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getAdminOrderById,
  getMyOrderById,
  listAdminOrders,
  listMyOrders,
  updateAdminOrderStatus,
} from "./order.service.js";
import {
  orderQuerySchema,
  updateOrderStatusSchema,
} from "./order.validation.js";

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

export const getMyOrdersHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(orderQuerySchema, req.query);
    const result = await listMyOrders(req.authUser!.id, query);

    res.status(200).json(new ApiResponse(200, "Orders fetched", result));
  },
);

export const getMyOrderByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const order = await getMyOrderById(
      req.authUser!.id,
      getStringParam(req.params.id),
    );

    res.status(200).json(new ApiResponse(200, "Order fetched", { order }));
  },
);

export const getAdminOrdersHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(orderQuerySchema, req.query);
    const result = await listAdminOrders(query);

    res.status(200).json(new ApiResponse(200, "Orders fetched", result));
  },
);

export const getAdminOrderByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const order = await getAdminOrderById(getStringParam(req.params.id));

    res.status(200).json(new ApiResponse(200, "Order fetched", { order }));
  },
);

export const updateAdminOrderStatusHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(updateOrderStatusSchema, req.body);
    const order = await updateAdminOrderStatus(
      req.authUser!.id,
      getStringParam(req.params.id),
      payload,
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Order status updated", { order }));
  },
);
