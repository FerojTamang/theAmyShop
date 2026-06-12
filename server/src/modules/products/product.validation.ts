import { StockType } from "../../../generated/prisma/client.js";
import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug cannot be empty")
  .regex(/^[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*$/, "Slug must be URL-safe");

const decimalLikeSchema = z.coerce.number().finite().min(0);

const productImageSchema = z.object({
  imageUrl: z.string().trim().url("Image URL must be valid"),
  publicId: z.string().trim().min(1, "Image publicId is required"),
  isPrimary: z.boolean().optional(),
});

export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
  stockType: z.nativeEnum(StockType).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const createProductSchema = z.object({
  categoryId: z.string().trim().min(1, "Category is required"),
  name: z.string().trim().min(2, "Product name is required"),
  slug: slugSchema.optional(),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().min(1, "Description is required"),
  productStory: z.string().trim().optional(),
  material: z.string().trim().optional(),
  careInstructions: z.string().trim().optional(),
  makingTime: z.string().trim().optional(),
  price: decimalLikeSchema,
  compareAtPrice: decimalLikeSchema.optional(),
  stock: z.coerce.number().int().min(0),
  stockType: z.nativeEnum(StockType).optional(),
  isCustomizable: z.boolean().optional(),
  isGiftSupported: z.boolean().optional(),
  isActive: z.boolean().optional(),
  images: z.array(productImageSchema).optional(),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
