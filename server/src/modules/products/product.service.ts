import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateSlug } from "../../utils/generateSlug.js";
import type {
  CreateProductInput,
  ProductQueryInput,
  UpdateProductInput,
} from "./product.validation.js";

const productInclude = {
  category: true,
  images: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
} as const;

const normalizeProductSlug = (name: string, slug?: string): string => {
  const normalizedSlug = generateSlug(slug ?? name);

  if (!normalizedSlug) {
    throw new ApiError(400, "A valid product slug is required");
  }

  return normalizedSlug;
};

const ensureProductSlugIsUnique = async (
  slug: string,
  currentProductId?: string,
): Promise<void> => {
  const existingProduct = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existingProduct && existingProduct.id !== currentProductId) {
    throw new ApiError(409, "Product slug already exists");
  }
};

const ensureCategoryExists = async (categoryId: string): Promise<void> => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new ApiError(400, "Category does not exist");
  }
};

const ensureOnlyOnePrimaryImage = (
  images: CreateProductInput["images"] | UpdateProductInput["images"],
): void => {
  const primaryImageCount =
    images?.filter((image) => image.isPrimary === true).length ?? 0;

  if (primaryImageCount > 1) {
    throw new ApiError(400, "Only one primary image is allowed");
  }
};

export const listPublicProducts = async (query: ProductQueryInput) => {
  const skip = (query.page - 1) * query.limit;

  const where = {
    isActive: true,
    ...(query.categoryId && { categoryId: query.categoryId }),
    ...(query.categorySlug && {
      category: {
        slug: generateSlug(query.categorySlug),
        isActive: true,
      },
    }),
    ...(query.stockType && { stockType: query.stockType }),
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: "insensitive" as const } },
        {
          shortDescription: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        },
        {
          description: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getPublicProductBySlug = async (slug: string) => {
  const product = await prisma.product.findFirst({
    where: {
      slug: generateSlug(slug),
      isActive: true,
      category: {
        isActive: true,
      },
    },
    include: productInclude,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return product;
};

export const createProduct = async (input: CreateProductInput) => {
  const slug = normalizeProductSlug(input.name, input.slug);

  await ensureProductSlugIsUnique(slug);
  await ensureCategoryExists(input.categoryId);
  ensureOnlyOnePrimaryImage(input.images);

  return prisma.$transaction(async (tx) => {
    return tx.product.create({
      data: {
        categoryId: input.categoryId,
        name: input.name,
        slug,
        shortDescription: input.shortDescription,
        description: input.description,
        productStory: input.productStory,
        material: input.material,
        careInstructions: input.careInstructions,
        makingTime: input.makingTime,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        stock: input.stock,
        stockType: input.stockType,
        isCustomizable: input.isCustomizable ?? false,
        isGiftSupported: input.isGiftSupported ?? false,
        isActive: input.isActive ?? true,
        images: input.images?.length
          ? {
              create: input.images.map((image) => ({
                imageUrl: image.imageUrl,
                publicId: image.publicId,
                isPrimary: image.isPrimary ?? false,
              })),
            }
          : undefined,
      },
      include: productInclude,
    });
  });
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });

  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  const slug = input.slug ? generateSlug(input.slug) : undefined;

  if (slug) {
    await ensureProductSlugIsUnique(slug, id);
  }

  if (input.categoryId) {
    await ensureCategoryExists(input.categoryId);
  }

  ensureOnlyOnePrimaryImage(input.images);

  return prisma.$transaction(async (tx) => {
    if (input.images) {
      await tx.productImage.deleteMany({
        where: { productId: id },
      });
    }

    return tx.product.update({
      where: { id },
      data: {
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.name !== undefined && { name: input.name }),
        ...(slug !== undefined && { slug }),
        ...(input.shortDescription !== undefined && {
          shortDescription: input.shortDescription,
        }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.productStory !== undefined && {
          productStory: input.productStory,
        }),
        ...(input.material !== undefined && { material: input.material }),
        ...(input.careInstructions !== undefined && {
          careInstructions: input.careInstructions,
        }),
        ...(input.makingTime !== undefined && { makingTime: input.makingTime }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.compareAtPrice !== undefined && {
          compareAtPrice: input.compareAtPrice,
        }),
        ...(input.stock !== undefined && { stock: input.stock }),
        ...(input.stockType !== undefined && { stockType: input.stockType }),
        ...(input.isCustomizable !== undefined && {
          isCustomizable: input.isCustomizable,
        }),
        ...(input.isGiftSupported !== undefined && {
          isGiftSupported: input.isGiftSupported,
        }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.images?.length
          ? {
              images: {
                create: input.images.map((image) => ({
                  imageUrl: image.imageUrl,
                  publicId: image.publicId,
                  isPrimary: image.isPrimary ?? false,
                })),
              },
            }
          : {}),
      },
      include: productInclude,
    });
  });
};

export const softDeleteProduct = async (id: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  return prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: productInclude,
  });
};
