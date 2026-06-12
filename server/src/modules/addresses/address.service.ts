import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";
import type { AddressSummary } from "./address.types.js";
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from "./address.validation.js";

type AddressClient = Prisma.TransactionClient | typeof prisma;

const addressSelect = {
  id: true,
  userId: true,
  fullName: true,
  phone: true,
  province: true,
  district: true,
  city: true,
  streetAddress: true,
  landmark: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} as const;

const unsetOtherDefaultAddresses = async (
  client: AddressClient,
  userId: string,
  currentAddressId?: string,
): Promise<void> => {
  await client.address.updateMany({
    where: {
      userId,
      ...(currentAddressId && {
        id: {
          not: currentAddressId,
        },
      }),
    },
    data: {
      isDefault: false,
    },
  });
};

const findOwnedAddress = async (
  client: AddressClient,
  userId: string,
  addressId: string,
): Promise<AddressSummary> => {
  const address = await client.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
    select: addressSelect,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  return address;
};

export const createAddress = async (
  userId: string,
  input: CreateAddressInput,
): Promise<AddressSummary> => {
  return prisma.$transaction(async (tx) => {
    if (input.isDefault === true) {
      await unsetOtherDefaultAddresses(tx, userId);
    }

    return tx.address.create({
      data: {
        userId,
        fullName: input.fullName,
        phone: input.phone,
        province: input.province,
        district: input.district,
        city: input.city,
        streetAddress: input.streetAddress,
        landmark: input.landmark,
        isDefault: input.isDefault ?? false,
      },
      select: addressSelect,
    });
  });
};

export const listMyAddresses = async (
  userId: string,
): Promise<AddressSummary[]> => {
  return prisma.address.findMany({
    where: { userId },
    select: addressSelect,
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
};

export const getMyAddressById = async (
  userId: string,
  addressId: string,
): Promise<AddressSummary> => {
  return findOwnedAddress(prisma, userId, addressId);
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  input: UpdateAddressInput,
): Promise<AddressSummary> => {
  return prisma.$transaction(async (tx) => {
    await findOwnedAddress(tx, userId, addressId);

    if (input.isDefault === true) {
      await unsetOtherDefaultAddresses(tx, userId, addressId);
    }

    return tx.address.update({
      where: { id: addressId },
      data: {
        ...(input.fullName !== undefined && { fullName: input.fullName }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.province !== undefined && { province: input.province }),
        ...(input.district !== undefined && { district: input.district }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.streetAddress !== undefined && {
          streetAddress: input.streetAddress,
        }),
        ...(input.landmark !== undefined && { landmark: input.landmark }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
      },
      select: addressSelect,
    });
  });
};

export const deleteAddress = async (
  userId: string,
  addressId: string,
): Promise<AddressSummary> => {
  return prisma.$transaction(async (tx) => {
    const address = await findOwnedAddress(tx, userId, addressId);
    const relatedOrderCount = await tx.order.count({
      where: {
        addressId,
        userId,
      },
    });

    if (relatedOrderCount > 0) {
      throw new ApiError(400, "Address is already used by an order");
    }

    await tx.address.delete({
      where: { id: addressId },
    });

    return address;
  });
};
