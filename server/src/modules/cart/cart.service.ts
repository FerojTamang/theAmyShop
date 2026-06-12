import { StockType } from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import type { AddCartItemInput, UpdateCartItemInput } from "./cart.validation.js";

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          category: true,
          images: {
            orderBy: {
              createdAt: "asc" as const,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
} as const;

type CartWithItems = Awaited<ReturnType<typeof fetchCartById>>;
type CartItemWithProduct = NonNullable<CartWithItems>["items"][number];

const decimalToNumber = (value: unknown): number => {
  return Number(value);
};

const money = (value: number): string => {
  return value.toFixed(2);
};

const calculateCartSummary = (items: CartItemWithProduct[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    return sum + decimalToNumber(item.priceSnapshot) * item.quantity;
  }, 0);

  return {
    totalItems,
    subtotal: money(subtotal),
  };
};

const mapCartItem = (item: CartItemWithProduct) => {
  const priceSnapshot = decimalToNumber(item.priceSnapshot);

  return {
    ...item,
    priceSnapshot: money(priceSnapshot),
    lineTotal: money(priceSnapshot * item.quantity),
  };
};

const formatCart = (cart: NonNullable<CartWithItems>) => {
  const items = cart.items.map(mapCartItem);

  return {
    cart: {
      ...cart,
      items,
    },
    summary: calculateCartSummary(cart.items),
  };
};

const fetchCartById = async (cartId: string) => {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: cartInclude,
  });
};

const getOrCreateCartRecord = async (userId: string) => {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });
};

const getFormattedCartById = async (cartId: string) => {
  const cart = await fetchCartById(cartId);

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  return formatCart(cart);
};

const ensureProductCanBeAdded = (
  product: {
    isActive: boolean;
    stock: number;
    stockType: StockType;
  },
  quantity: number,
): void => {
  if (!product.isActive) {
    throw new ApiError(400, "Product is not active");
  }

  if (product.stock <= 0) {
    throw new ApiError(400, "Product is out of stock");
  }

  if (product.stockType === StockType.OUT_OF_STOCK) {
    throw new ApiError(400, "Product is out of stock");
  }

  if (product.stockType === StockType.READY_STOCK && quantity > product.stock) {
    throw new ApiError(400, "Quantity exceeds available stock");
  }
};

export const getCart = async (userId: string) => {
  const cart = await getOrCreateCartRecord(userId);

  return getFormattedCartById(cart.id);
};

export const addCartItem = async (userId: string, input: AddCartItemInput) => {
  const cart = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: input.productId },
      select: {
        id: true,
        price: true,
        stock: true,
        stockType: true,
        isActive: true,
      },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const cartRecord = await tx.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      select: { id: true },
    });

    const existingItem = await tx.cartItem.findFirst({
      where: {
        cartId: cartRecord.id,
        productId: product.id,
        customizationRequestId: null,
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    const nextQuantity = existingItem
      ? existingItem.quantity + input.quantity
      : input.quantity;

    ensureProductCanBeAdded(product, nextQuantity);

    if (existingItem) {
      await tx.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: nextQuantity,
          priceSnapshot: product.price,
        },
      });
    } else {
      await tx.cartItem.create({
        data: {
          cartId: cartRecord.id,
          productId: product.id,
          quantity: input.quantity,
          priceSnapshot: product.price,
        },
      });
    }

    return cartRecord;
  });

  return getFormattedCartById(cart.id);
};

export const updateCartItem = async (
  userId: string,
  itemId: string,
  input: UpdateCartItemInput,
) => {
  const cart = await prisma.$transaction(async (tx) => {
    const cartItem = await tx.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId,
        },
      },
      include: {
        product: {
          select: {
            price: true,
            stock: true,
            stockType: true,
            isActive: true,
          },
        },
        cart: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!cartItem) {
      throw new ApiError(404, "Cart item not found");
    }

    ensureProductCanBeAdded(cartItem.product, input.quantity);

    await tx.cartItem.update({
      where: { id: cartItem.id },
      data: {
        quantity: input.quantity,
        priceSnapshot: cartItem.product.price,
      },
    });

    return cartItem.cart;
  });

  return getFormattedCartById(cart.id);
};

export const removeCartItem = async (userId: string, itemId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const result = await prisma.cartItem.deleteMany({
    where: {
      id: itemId,
      cartId: cart.id,
    },
  });

  if (result.count === 0) {
    throw new ApiError(404, "Cart item not found");
  }

  return getFormattedCartById(cart.id);
};

export const clearCart = async (userId: string) => {
  const cart = await getOrCreateCartRecord(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return getFormattedCartById(cart.id);
};
