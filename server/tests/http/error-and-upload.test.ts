import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../../src/app.js";
import { errorMiddleware } from "../../src/middlewares/error.middleware.js";
import { uploadSingleImage } from "../../src/middlewares/upload.middleware.js";
import { DATABASE_UNAVAILABLE_MESSAGE } from "../../src/utils/databaseError.js";

const createUploadTestApp = () => {
  const testApp = express();
  testApp.post("/upload", uploadSingleImage, (_req, res) => {
    res.status(201).json({ success: true });
  });
  testApp.use(errorMiddleware);
  return testApp;
};

describe("upload and database error normalization", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a friendly 413 response for images larger than 5MB", async () => {
    const response = await request(createUploadTestApp())
      .post("/upload")
      .attach("image", Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: "oversized.jpg",
        contentType: "image/jpeg",
      });

    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      success: false,
      statusCode: 413,
      message: "Image is too large. Maximum allowed size is 5MB.",
      errors: [],
    });
  });

  it("returns a friendly 400 response for an invalid image MIME type", async () => {
    const response = await request(createUploadTestApp())
      .post("/upload")
      .attach("image", Buffer.from("not an image"), {
        filename: "invalid.txt",
        contentType: "text/plain",
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      statusCode: 400,
      message: "Invalid image type. Please upload JPG, PNG, or WEBP.",
      errors: [],
    });
  });

  it("normalizes database outages without exposing technical connection details", async () => {
    const testApp = express();
    const fakeDatabaseUrl =
      "postgresql://secret-tenant:secret-password@secret-db.internal:5432/postgres";
    const socketError = Object.assign(
      new Error(
        "getaddrinfo ENOTFOUND secret-db.internal: tenant or user secret-tenant not found",
      ),
      {
        code: "ENOTFOUND",
        connectionString: fakeDatabaseUrl,
      },
    );
    const adapterError = Object.assign(new Error("Failed to connect"), {
      name: "DriverAdapterError",
      cause: {
        adapterName: "PrismaPgAdapter",
        error: socketError,
      },
    });
    const databaseError = new Error("Prisma query failed", {
      cause: adapterError,
    });
    Object.defineProperty(databaseError, "originalError", {
      configurable: true,
      enumerable: false,
      value: {
        message: "Can't reach database server at secret-db.internal",
        stack: `DriverAdapterError: PrismaPgAdapter ${fakeDatabaseUrl}`,
      },
    });

    testApp.get("/database-error", (_req, _res, next) => {
      next(databaseError);
    });
    testApp.use(errorMiddleware);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const response = await request(testApp).get("/database-error");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      success: false,
      statusCode: 503,
      message: DATABASE_UNAVAILABLE_MESSAGE,
      errors: [],
    });

    const responseText = JSON.stringify(response.body);
    expect(responseText).not.toContain("secret-db.internal");
    expect(responseText).not.toContain("secret-tenant");
    expect(responseText).not.toContain("stack");
    expect(responseText).not.toContain("PrismaPgAdapter");
    expect(responseText).not.toContain("DriverAdapterError");
    expect(responseText).not.toContain(fakeDatabaseUrl);
    expect(responseText).not.toContain("postgresql://");
    expect(response.body).not.toHaveProperty("stack");
    expect(consoleError).toHaveBeenCalledWith(
      "Database connection error",
      databaseError,
    );
  });
});

describe("CORS origin allowlist", () => {
  it.each([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ])("allows the trusted development origin %s", async (origin) => {
    const response = await request(app).get("/api/health").set("Origin", origin);

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(origin);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("does not approve a non-allowlisted origin", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "http://untrusted.example.test");

    expect(response.status).toBe(200);
    expect(response.headers).not.toHaveProperty("access-control-allow-origin");
  });

  it("allows requests without an Origin header", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      statusCode: 200,
    });
  });
});
