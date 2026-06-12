import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getAdminPaymentById,
  getMyPaymentById,
  initiateEsewaPayment,
  initiateKhaltiPayment,
  listAdminPayments,
  listMyPayments,
  updateAdminPaymentStatus,
  verifyEsewaPayment,
  verifyKhaltiPayment,
} from "./payment.service.js";
import {
  esewaVerifyPaymentSchema,
  initiatePaymentSchema,
  khaltiVerifyPaymentSchema,
  paymentQuerySchema,
  updatePaymentStatusSchema,
} from "./payment.validation.js";

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

export const getMyPaymentsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(paymentQuerySchema, req.query);
    const result = await listMyPayments(req.authUser!.id, query);

    res.status(200).json(new ApiResponse(200, "Payments fetched", result));
  },
);

export const getMyPaymentByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payment = await getMyPaymentById(
      req.authUser!.id,
      getStringParam(req.params.id),
    );

    res.status(200).json(new ApiResponse(200, "Payment fetched", { payment }));
  },
);

export const initiateKhaltiPaymentHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(initiatePaymentSchema, req.body);
    const result = await initiateKhaltiPayment(req.authUser!.id, payload);

    res
      .status(200)
      .json(new ApiResponse(200, "Khalti payment initiated", result));
  },
);

export const verifyKhaltiPaymentHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(khaltiVerifyPaymentSchema, req.body);
    const result = await verifyKhaltiPayment(req.authUser!.id, payload);

    res
      .status(200)
      .json(new ApiResponse(200, "Khalti payment verified", result));
  },
);

export const initiateEsewaPaymentHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(initiatePaymentSchema, req.body);
    const result = await initiateEsewaPayment(req.authUser!.id, payload);

    res
      .status(200)
      .json(new ApiResponse(200, "eSewa payment initiated", result));
  },
);

export const verifyEsewaPaymentHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(esewaVerifyPaymentSchema, req.body);
    const result = await verifyEsewaPayment(req.authUser!.id, payload);

    res.status(200).json(new ApiResponse(200, "eSewa payment verified", result));
  },
);

export const getAdminPaymentsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(paymentQuerySchema, req.query);
    const result = await listAdminPayments(query);

    res.status(200).json(new ApiResponse(200, "Payments fetched", result));
  },
);

export const getAdminPaymentByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payment = await getAdminPaymentById(getStringParam(req.params.id));

    res.status(200).json(new ApiResponse(200, "Payment fetched", { payment }));
  },
);

export const updateAdminPaymentStatusHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(updatePaymentStatusSchema, req.body);
    const payment = await updateAdminPaymentStatus(
      getStringParam(req.params.id),
      payload,
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Payment status updated", { payment }));
  },
);
