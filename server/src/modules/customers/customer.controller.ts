import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getAdminCustomerById,
  listAdminCustomers,
  updateAdminCustomerStatus,
} from "./customer.service.js";
import {
  customerQuerySchema,
  updateCustomerStatusSchema,
} from "./customer.validation.js";

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

export const getAdminCustomersHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(customerQuerySchema, req.query);
    const result = await listAdminCustomers(query);

    res.status(200).json(new ApiResponse(200, "Customers fetched", result));
  },
);

export const getAdminCustomerByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const result = await getAdminCustomerById(getStringParam(req.params.id));

    res.status(200).json(new ApiResponse(200, "Customer fetched", result));
  },
);

export const updateAdminCustomerStatusHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(updateCustomerStatusSchema, req.body);
    const customer = await updateAdminCustomerStatus(
      getStringParam(req.params.id),
      payload,
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Customer status updated", { customer }));
  },
);
