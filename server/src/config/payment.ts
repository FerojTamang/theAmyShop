import { config } from "./env.js";

export const paymentConfig = {
  khalti: {
    secretKey: config.KHALTI_SECRET_KEY,
    publicKey: config.KHALTI_PUBLIC_KEY,
    baseUrl: config.KHALTI_BASE_URL,
  },
  esewa: {
    merchantCode: config.ESEWA_MERCHANT_CODE,
    secretKey: config.ESEWA_SECRET_KEY,
    baseUrl: config.ESEWA_BASE_URL,
  },
  successUrl: config.PAYMENT_SUCCESS_URL,
  failureUrl: config.PAYMENT_FAILURE_URL,
} as const;

export const isKhaltiConfigured = (): boolean => {
  return Boolean(
    paymentConfig.khalti.secretKey &&
      paymentConfig.khalti.publicKey &&
      paymentConfig.khalti.baseUrl,
  );
};

export const isEsewaConfigured = (): boolean => {
  return Boolean(
    paymentConfig.esewa.merchantCode &&
      paymentConfig.esewa.secretKey &&
      paymentConfig.esewa.baseUrl,
  );
};
