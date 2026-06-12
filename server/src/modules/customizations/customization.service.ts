import { CustomizationStatus } from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import type {
  AdminCustomizationQueryInput,
  CreateCustomizationInput,
  UpdateCustomizationStatusInput,
} from "./customization.validation.js";

const customizationInclude = {
  product: {
    include: {
      images: {
        orderBy: {
          createdAt: "asc" as const,
        },
      },
      category: true,
    },
  },
  referenceImages: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
} as const;

const adminCustomizationInclude = {
  ...customizationInclude,
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
    },
  },
} as const;

export const createCustomizationRequest = async (
  userId: string,
  input: CreateCustomizationInput,
) => {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: {
      id: true,
      isActive: true,
      isCustomizable: true,
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (!product.isActive) {
    throw new ApiError(400, "Product is not active");
  }

  if (!product.isCustomizable) {
    throw new ApiError(400, "Product does not support customization");
  }

  return prisma.$transaction(async (tx) => {
    return tx.customizationRequest.create({
      data: {
        userId,
        productId: product.id,
        customText: input.customText,
        colorPreference: input.colorPreference,
        sizePreference: input.sizePreference,
        designNote: input.designNote,
        neededByDate: input.neededByDate
          ? new Date(input.neededByDate)
          : undefined,
        status: CustomizationStatus.PENDING_REVIEW,
        referenceImages: input.referenceImages?.length
          ? {
              create: input.referenceImages.map((image) => ({
                imageUrl: image.imageUrl,
                publicId: image.publicId ?? "",
              })),
            }
          : undefined,
      },
      include: customizationInclude,
    });
  });
};

export const listMyCustomizationRequests = async (userId: string) => {
  return prisma.customizationRequest.findMany({
    where: { userId },
    include: customizationInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getMyCustomizationRequestById = async (
  userId: string,
  id: string,
) => {
  const customization = await prisma.customizationRequest.findFirst({
    where: {
      id,
      userId,
    },
    include: customizationInclude,
  });

  if (!customization) {
    throw new ApiError(404, "Customization request not found");
  }

  return customization;
};

export const listAdminCustomizationRequests = async (
  query: AdminCustomizationQueryInput,
) => {
  const skip = (query.page - 1) * query.limit;
  const where = {
    ...(query.status && { status: query.status }),
    ...(query.productId && { productId: query.productId }),
    ...(query.userId && { userId: query.userId }),
  };

  const [customizations, total] = await Promise.all([
    prisma.customizationRequest.findMany({
      where,
      include: adminCustomizationInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.customizationRequest.count({ where }),
  ]);

  return {
    customizations,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getAdminCustomizationRequestById = async (id: string) => {
  const customization = await prisma.customizationRequest.findUnique({
    where: { id },
    include: adminCustomizationInclude,
  });

  if (!customization) {
    throw new ApiError(404, "Customization request not found");
  }

  return customization;
};

export const updateCustomizationStatus = async (
  id: string,
  input: UpdateCustomizationStatusInput,
) => {
  const existingCustomization = await prisma.customizationRequest.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingCustomization) {
    throw new ApiError(404, "Customization request not found");
  }

  return prisma.customizationRequest.update({
    where: { id },
    data: {
      status: input.status,
      ...(input.adminNote !== undefined && { adminNote: input.adminNote }),
    },
    include: adminCustomizationInclude,
  });
};
