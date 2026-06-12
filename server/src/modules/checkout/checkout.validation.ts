import { PaymentMethod } from "../../../generated/prisma/client.js";
import { z } from "zod";

const moneySchema = z.coerce.number().finite().min(0);

const requiredTextSchema = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const giftSchema = z
  .object({
    receiverName: requiredTextSchema("Receiver name"),
    senderName: requiredTextSchema("Sender name"),
    giftMessage: requiredTextSchema("Gift message").max(
      500,
      "Gift message is too long",
    ),
    giftWrapRequired: z.boolean().default(false),
    giftWrapFee: moneySchema.default(0),
  })
  .superRefine((value, context) => {
    if (!value.giftWrapRequired && value.giftWrapFee > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["giftWrapFee"],
        message: "Gift wrap fee requires giftWrapRequired to be true",
      });
    }
  });

export const checkoutSchema = z.object({
  addressId: requiredTextSchema("Address"),
  paymentMethod: z.literal(PaymentMethod.CASH_ON_DELIVERY, {
    message: "Only Cash on Delivery is supported in Sprint 9B",
  }),
  couponCode: z
    .string()
    .trim()
    .min(1, "Coupon code cannot be empty")
    .max(50, "Coupon code is too long")
    .transform((value) => value.toUpperCase())
    .optional(),
  shippingFee: moneySchema.default(0),
  gift: giftSchema.optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
