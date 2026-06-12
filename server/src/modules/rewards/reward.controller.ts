import type { RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  adjustRewardWallet,
  getAdminRewardWalletByUserId,
  getMyRewardWallet,
  listAdminRewardTransactions,
  listAdminRewardWallets,
  listMyRewardTransactions,
} from "./reward.service.js";
import {
  adjustRewardSchema,
  rewardTransactionQuerySchema,
  rewardWalletQuerySchema,
} from "./reward.validation.js";

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

export const getMyRewardWalletHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const wallet = await getMyRewardWallet(req.authUser!.id);

    res
      .status(200)
      .json(new ApiResponse(200, "Reward wallet fetched", { wallet }));
  },
);

export const getMyRewardTransactionsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(rewardTransactionQuerySchema, req.query);
    const result = await listMyRewardTransactions(req.authUser!.id, query);

    res
      .status(200)
      .json(new ApiResponse(200, "Reward transactions fetched", result));
  },
);

export const getAdminRewardWalletsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(rewardWalletQuerySchema, req.query);
    const result = await listAdminRewardWallets(query);

    res
      .status(200)
      .json(new ApiResponse(200, "Reward wallets fetched", result));
  },
);

export const getAdminRewardWalletByUserIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const wallet = await getAdminRewardWalletByUserId(
      getStringParam(req.params.userId),
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Reward wallet fetched", { wallet }));
  },
);

export const getAdminRewardTransactionsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = validate(rewardTransactionQuerySchema, req.query);
    const result = await listAdminRewardTransactions(query);

    res
      .status(200)
      .json(new ApiResponse(200, "Reward transactions fetched", result));
  },
);

export const adjustRewardWalletHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const payload = validate(adjustRewardSchema, req.body);
    const result = await adjustRewardWallet(payload);

    res
      .status(200)
      .json(new ApiResponse(200, "Reward wallet adjusted", result));
  },
);
