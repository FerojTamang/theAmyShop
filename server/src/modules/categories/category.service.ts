import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateSlug } from "../../utils/generateSlug.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.validation.js";

const categoryInclude = {
  _count: {
    select: {
      products: true,
    },
  },
} as const;

const normalizeCategorySlug = (name: string, slug?: string): string => {
  const normalizedSlug = generateSlug(slug ?? name);

  if (!normalizedSlug) {
    throw new ApiError(400, "A valid category slug is required");
  }

  return normalizedSlug;
};

const ensureCategorySlugIsUnique = async (
  slug: string,
  currentCategoryId?: string,
): Promise<void> => {
  const existingCategory = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existingCategory && existingCategory.id !== currentCategoryId) {
    throw new ApiError(409, "Category slug already exists");
  }
};

export const listPublicCategories = async () => {
  return prisma.category.findMany({
    where: { isActive: true },
    include: categoryInclude,
    orderBy: { name: "asc" },
  });
};

export const getPublicCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findFirst({
    where: {
      slug: generateSlug(slug),
      isActive: true,
    },
    include: {
      products: {
        where: { isActive: true },
        include: {
          images: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

export const createCategory = async (input: CreateCategoryInput) => {
  const slug = normalizeCategorySlug(input.name, input.slug);
  await ensureCategorySlugIsUnique(slug);

  return prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      isActive: input.isActive ?? true,
    },
  });
};

export const updateCategory = async (
  id: string,
  input: UpdateCategoryInput,
) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true },
  });

  if (!existingCategory) {
    throw new ApiError(404, "Category not found");
  }

  const slug = input.slug ? generateSlug(input.slug) : undefined;

  if (slug) {
    await ensureCategorySlugIsUnique(slug, id);
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(slug !== undefined && { slug }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
};

export const softDeleteCategory = async (id: string) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingCategory) {
    throw new ApiError(404, "Category not found");
  }

  return prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
};
