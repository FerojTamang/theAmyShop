import { vi } from "vitest";

export const prismaMock = {
  $transaction: vi.fn(),
  coupon: {
    findUnique: vi.fn(),
    update: vi.fn(),
    updateManyAndReturn: vi.fn(),
  },
  order: {
    findUniqueOrThrow: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
  },
  storeSettings: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
};

export const createCheckoutTransactionMock = () => ({
  address: {
    findFirst: vi.fn(),
  },
  cart: {
    findUnique: vi.fn(),
  },
  cartItem: {
    deleteMany: vi.fn(),
  },
  coupon: {
    findUnique: vi.fn(),
    updateManyAndReturn: vi.fn(),
  },
  couponRedemption: {
    count: vi.fn(),
    create: vi.fn(),
  },
  order: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
  },
  orderStatusHistory: {
    create: vi.fn(),
  },
  product: {
    updateMany: vi.fn(),
  },
});

export const mockInteractiveTransaction = <T extends object>(tx: T): void => {
  prismaMock.$transaction.mockImplementation(
    async (callback: (client: T) => Promise<unknown>) => callback(tx),
  );
};
