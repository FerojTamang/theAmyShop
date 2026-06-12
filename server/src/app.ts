import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { addressRoutes } from "./modules/addresses/address.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import {
  adminCategoryRoutes,
  categoryRoutes,
} from "./modules/categories/category.routes.js";
import { cartRoutes } from "./modules/cart/cart.routes.js";
import {
  adminCouponRoutes,
  couponRoutes,
} from "./modules/coupons/coupon.routes.js";
import {
  adminCustomizationRoutes,
  customizationRoutes,
} from "./modules/customizations/customization.routes.js";
import { adminGiftOptionRoutes } from "./modules/gift-options/giftOption.routes.js";
import { checkoutRoutes } from "./modules/checkout/checkout.routes.js";
import {
  adminOrderRoutes,
  orderRoutes,
} from "./modules/orders/order.routes.js";
import {
  adminPaymentRoutes,
  paymentRoutes,
} from "./modules/payments/payment.routes.js";
import {
  adminProductRoutes,
  productRoutes,
} from "./modules/products/product.routes.js";
import {
  adminUploadRoutes,
  uploadRoutes,
} from "./modules/uploads/upload.routes.js";
import { ApiResponse } from "./utils/ApiResponse.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.status(200).json(
    new ApiResponse(200, "The AMY Shop API is healthy", {
      status: "ok",
      environment: config.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );
});

app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin/coupons", adminCouponRoutes);
app.use("/api/customizations", customizationRoutes);
app.use("/api/admin/customizations", adminCustomizationRoutes);
app.use("/api/admin/gift-options", adminGiftOptionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/admin/uploads", adminUploadRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
