import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
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
    const technicalMessage =
      "getaddrinfo ENOTFOUND secret-db.internal tenant/user secret-tenant not found";
    const databaseError = Object.assign(new Error(technicalMessage), {
      name: "DriverAdapterError",
      code: "ENOTFOUND",
    });

    testApp.get("/database-error", (_req, _res, next) => {
      next(databaseError);
    });
    testApp.use(errorMiddleware);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

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
    expect(responseText).not.toContain("DriverAdapterError");
    expect(response.body).not.toHaveProperty("stack");
  });
});
