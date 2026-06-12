import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCustomizationRequest,
  getAdminCustomizationRequestById,
  getMyCustomizationRequestById,
  listAdminCustomizationRequests,
  listMyCustomizationRequests,
  updateCustomizationStatus,
} from "./customization.service.js";
import {
  adminCustomizationQuerySchema,
  createCustomizationSchema,
  updateCustomizationStatusSchema,
} from "./customization.validation.js";

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

export const createCustomizationHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(createCustomizationSchema, req.body);
    const customization = await createCustomizationRequest(
      req.authUser!.id,
      payload,
    );

    res
      .status(201)
      .json(
        new ApiResponse(201, "Customization request created", {
          customization,
        }),
      );
  },
);

export const getMyCustomizationsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const customizations = await listMyCustomizationRequests(req.authUser!.id);

    res
      .status(200)
      .json(
        new ApiResponse(200, "Customization requests fetched", {
          customizations,
        }),
      );
  },
);

export const getMyCustomizationByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const customization = await getMyCustomizationRequestById(
      req.authUser!.id,
      getStringParam(req.params.id),
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Customization request fetched", { customization }));
  },
);

export const getAdminCustomizationsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(adminCustomizationQuerySchema, req.query);
    const result = await listAdminCustomizationRequests(query);

    res
      .status(200)
      .json(new ApiResponse(200, "Customization requests fetched", result));
  },
);

export const getAdminCustomizationByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const customization = await getAdminCustomizationRequestById(
      getStringParam(req.params.id),
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Customization request fetched", { customization }));
  },
);

export const updateCustomizationStatusHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(updateCustomizationStatusSchema, req.body);
    const customization = await updateCustomizationStatus(
      getStringParam(req.params.id),
      payload,
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, "Customization status updated", { customization }),
      );
  },
);
