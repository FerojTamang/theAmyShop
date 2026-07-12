import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/database.js", async () => {
  const { prismaMock } = await import("../helpers/prismaMock.js");
  return { prisma: prismaMock };
});

import { AccountStatus, UserRole } from "../../generated/prisma/client.js";
import { app } from "../../src/app.js";
import { loginRateLimiter } from "../../src/middlewares/rateLimit.middleware.js";
import { loginUser } from "../../src/modules/auth/auth.service.js";
import { hashPassword } from "../../src/utils/hashPassword.js";
import { prismaMock } from "../helpers/prismaMock.js";

describe("authentication protection and abuse handling", () => {
  beforeEach(async () => {
    prismaMock.user.findFirst.mockReset();
    await Promise.all([
      loginRateLimiter.resetKey("127.0.0.1"),
      loginRateLimiter.resetKey("::1"),
      loginRateLimiter.resetKey("::ffff:127.0.0.1"),
    ]);
  });

  it("returns 401 when a protected route has no access token", async () => {
    const response = await request(app).get("/api/cart");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      statusCode: 401,
      message: "Authentication token is required",
      errors: [],
    });
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
  });

  it("keeps wrong-password login errors friendly", async () => {
    const passwordHash = await hashPassword("correct-password");
    prismaMock.user.findFirst.mockResolvedValue({
      id: "user-1",
      fullName: "QA Customer",
      email: "qa@example.test",
      phone: "9800000001",
      passwordHash,
      role: UserRole.CUSTOMER,
      status: AccountStatus.ACTIVE,
      emailVerified: false,
      phoneVerified: false,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

    await expect(
      loginUser({ identifier: "9800000001", password: "wrong-password" }),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid credentials",
    });
  });

  it("returns 429 on the sixth login attempt from one IP", async () => {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = await request(app).post("/api/auth/login").send({});
      expect(response.status).toBe(400);
    }

    const limitedResponse = await request(app).post("/api/auth/login").send({});

    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.body).toEqual({
      success: false,
      statusCode: 429,
      message: "Too many attempts. Please try again later.",
      errors: [],
    });
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
  });
});
