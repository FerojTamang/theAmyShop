import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createAddress,
  deleteAddress,
  getMyAddressById,
  listMyAddresses,
  updateAddress,
} from "./address.service.js";
import {
  createAddressSchema,
  updateAddressSchema,
} from "./address.validation.js";

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

const getAuthUserId = (req: Parameters<RequestHandler>[0]): string => {
  if (!req.authUser) {
    throw new ApiError(401, "Authentication is required");
  }

  return req.authUser.id;
};

const getStringParam = (value: string | string[] | undefined): string => {
  if (typeof value !== "string") {
    throw new ApiError(400, "Invalid route parameter");
  }

  return value;
};

export const createAddressHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(createAddressSchema, req.body);
    const address = await createAddress(getAuthUserId(req), payload);

    res
      .status(201)
      .json(new ApiResponse(201, "Address created", { address }));
  },
);

export const getMyAddressesHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const addresses = await listMyAddresses(getAuthUserId(req));

    res
      .status(200)
      .json(new ApiResponse(200, "Addresses fetched", { addresses }));
  },
);

export const getAddressByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const address = await getMyAddressById(
      getAuthUserId(req),
      getStringParam(req.params.id),
    );

    res.status(200).json(new ApiResponse(200, "Address fetched", { address }));
  },
);

export const updateAddressHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(updateAddressSchema, req.body);
    const address = await updateAddress(
      getAuthUserId(req),
      getStringParam(req.params.id),
      payload,
    );

    res.status(200).json(new ApiResponse(200, "Address updated", { address }));
  },
);

export const deleteAddressHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const address = await deleteAddress(
      getAuthUserId(req),
      getStringParam(req.params.id),
    );

    res.status(200).json(new ApiResponse(200, "Address deleted", { address }));
  },
);
