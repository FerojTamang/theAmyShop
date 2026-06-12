import type { RequestHandler } from "express";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadImage } from "./upload.service.js";
import { validateUploadedImage } from "./upload.validation.js";

export const uploadProductImageHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const file = validateUploadedImage(req.file);
    const image = await uploadImage(file, "the-amy-shop/products");

    res.status(201).json(new ApiResponse(201, "Product image uploaded", image));
  },
);

export const uploadCustomizationReferenceHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const file = validateUploadedImage(req.file);
    const image = await uploadImage(
      file,
      "the-amy-shop/customization-references",
    );

    res
      .status(201)
      .json(new ApiResponse(201, "Customization reference uploaded", image));
  },
);
