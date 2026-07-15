import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const paymentServiceSpies = vi.hoisted(() => ({
  initiateEsewaPayment: vi.fn(),
  initiateKhaltiPayment: vi.fn(),
  verifyEsewaPayment: vi.fn(),
  verifyKhaltiPayment: vi.fn(),
}));

vi.mock("../../src/config/database.js", async () => {
  const { prismaMock } = await import("../helpers/prismaMock.js");
  return { prisma: prismaMock };
});

vi.mock("../../src/middlewares/auth.middleware.js", () => ({
  authMiddleware: (req: { authUser?: { id: string; role: string } }, _res: unknown, next: () => void) => {
    req.authUser = { id: "customer-1", role: "CUSTOMER" };
    next();
  },
}));

vi.mock("../../src/modules/payments/payment.service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../src/modules/payments/payment.service.js")>()),
  ...paymentServiceSpies,
}));

import { app } from "../../src/app.js";

const unavailableRoutes = [
  "/api/payments/khalti/initiate",
  "/api/payments/khalti/verify",
  "/api/payments/esewa/initiate",
  "/api/payments/esewa/verify",
] as const;

describe("unavailable online payment routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(unavailableRoutes)("returns a safe 503 response for %s", async (route) => {
    const response = await request(app).post(route).send({
      orderId: "order-1",
      transactionId: "provider-transaction-1",
    });

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      success: false,
      statusCode: 503,
      message: "Online payments are currently unavailable. Please use Cash on Delivery.",
      errors: [],
    });
  });

  it("does not reach initiation or verification services", async () => {
    await Promise.all(
      unavailableRoutes.map((route) => request(app).post(route).send({ orderId: "order-1" })),
    );

    expect(paymentServiceSpies.initiateKhaltiPayment).not.toHaveBeenCalled();
    expect(paymentServiceSpies.verifyKhaltiPayment).not.toHaveBeenCalled();
    expect(paymentServiceSpies.initiateEsewaPayment).not.toHaveBeenCalled();
    expect(paymentServiceSpies.verifyEsewaPayment).not.toHaveBeenCalled();
  });
});
