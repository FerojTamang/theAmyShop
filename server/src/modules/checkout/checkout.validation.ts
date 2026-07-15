import { PaymentMethod } from "../../../generated/prisma/client.js";
import { z } from "zod";

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
  });

export const checkoutSchema = z.object({
  addressId: requiredTextSchema("Address"),
  paymentMethod: z.literal(PaymentMethod.CASH_ON_DELIVERY, {
    message: "Cash on Delivery is currently available.",
  }),
  couponCode: z
    .string()
    .trim()
    .min(1, "Coupon code cannot be empty")
    .max(50, "Coupon code is too long")
    .transform((value) => value.toUpperCase())
    .optional(),
  gift: giftSchema.optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
