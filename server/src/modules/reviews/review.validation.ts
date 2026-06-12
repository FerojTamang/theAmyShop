import { ReviewStatus } from "../../../generated/prisma/client.js";
import { z } from "zod";

const requiredTextSchema = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const commentSchema = z
  .string()
  .trim()
  .min(3, "Review comment is too short")
  .max(1000, "Review comment is too long");

export const reviewQuerySchema = z.object({
  status: z.nativeEnum(ReviewStatus).optional(),
  productId: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const publicProductReviewQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const createReviewSchema = z.object({
  productId: requiredTextSchema("Product"),
  orderId: requiredTextSchema("Order"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: commentSchema.optional(),
});

export const updateReviewSchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: commentSchema.nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const updateReviewStatusSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
});

export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;
export type PublicProductReviewQueryInput = z.infer<
  typeof publicProductReviewQuerySchema
>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type UpdateReviewStatusInput = z.infer<typeof updateReviewStatusSchema>;
