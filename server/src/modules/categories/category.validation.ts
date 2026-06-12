import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug cannot be empty")
  .regex(/^[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*$/, "Slug must be URL-safe");

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required"),
  slug: slugSchema.optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2, "Category name is required").optional(),
    slug: slugSchema.optional(),
    description: z.string().trim().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
