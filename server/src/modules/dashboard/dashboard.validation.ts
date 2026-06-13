import { z } from "zod";

const dateSchema = z.coerce
  .date()
  .refine((value) => !Number.isNaN(value.getTime()), "Invalid date");

const dateRangeFields = {
  from: dateSchema.optional(),
  to: dateSchema.optional(),
};

const validateDateRange = (
  value: { from?: Date; to?: Date },
  context: z.RefinementCtx,
) => {
  if (value.from && value.to && value.to < value.from) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["to"],
      message: "To date must be after from date",
    });
  }
};

export const dashboardDateRangeSchema = z
  .object(dateRangeFields)
  .superRefine(validateDateRange);

export const recentOrdersQuerySchema = z
  .object({
    ...dateRangeFields,
    limit: z.coerce.number().int().positive().max(50).default(10),
  })
  .superRefine(validateDateRange);

export const lowStockProductsQuerySchema = z.object({
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type DashboardDateRangeInput = z.infer<typeof dashboardDateRangeSchema>;
export type RecentOrdersQueryInput = z.infer<typeof recentOrdersQuerySchema>;
export type LowStockProductsQueryInput = z.infer<
  typeof lowStockProductsQuerySchema
>;
