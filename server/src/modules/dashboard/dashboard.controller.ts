import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getDashboardSummary,
  getLowStockProducts,
  getOrderStatusSummary,
  getPaymentStatusSummary,
  getRecentOrders,
  getReviewSummary,
  getSalesOverview,
} from "./dashboard.service.js";
import {
  dashboardDateRangeSchema,
  lowStockProductsQuerySchema,
  recentOrdersQuerySchema,
} from "./dashboard.validation.js";

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

export const getDashboardSummaryHandler: RequestHandler = asyncHandler(
  async (_req, res) => {
    const summary = await getDashboardSummary();

    res
      .status(200)
      .json(new ApiResponse(200, "Dashboard summary fetched", { summary }));
  },
);

export const getRecentOrdersHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(recentOrdersQuerySchema, req.query);
    const result = await getRecentOrders(query);

    res
      .status(200)
      .json(new ApiResponse(200, "Recent orders fetched", result));
  },
);

export const getLowStockProductsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(lowStockProductsQuerySchema, req.query);
    const result = await getLowStockProducts(query);

    res
      .status(200)
      .json(new ApiResponse(200, "Low stock products fetched", result));
  },
);

export const getSalesOverviewHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(dashboardDateRangeSchema, req.query);
    const result = await getSalesOverview(query);

    res
      .status(200)
      .json(new ApiResponse(200, "Sales overview fetched", result));
  },
);

export const getOrderStatusSummaryHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(dashboardDateRangeSchema, req.query);
    const result = await getOrderStatusSummary(query);

    res
      .status(200)
      .json(new ApiResponse(200, "Order status summary fetched", result));
  },
);

export const getPaymentStatusSummaryHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(dashboardDateRangeSchema, req.query);
    const result = await getPaymentStatusSummary(query);

    res
      .status(200)
      .json(new ApiResponse(200, "Payment status summary fetched", result));
  },
);

export const getReviewSummaryHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(dashboardDateRangeSchema, req.query);
    const result = await getReviewSummary(query);

    res
      .status(200)
      .json(new ApiResponse(200, "Review summary fetched", result));
  },
);
