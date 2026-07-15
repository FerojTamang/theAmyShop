import { z } from "zod";

const optionalText = (maximumLength: number) =>
  z
    .union([z.string().trim().max(maximumLength), z.null()])
    .optional()
    .transform((value) => (typeof value === "string" && value.length === 0 ? null : value));

const optionalHttpUrl = z
  .union([z.string().trim().max(2048), z.null()])
  .optional()
  .transform((value, context) => {
    if (value === null || value === undefined || value === "") return value || null;

    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
      return url.toString();
    } catch {
      context.addIssue({ code: "custom", message: "URL must use http or https" });
      return z.NEVER;
    }
  });

export const updateStoreSettingsSchema = z
  .object({
    footerDescription: optionalText(500),
    instagramUrl: optionalHttpUrl,
    tiktokUrl: optionalHttpUrl,
    logoUrl: optionalHttpUrl,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;
