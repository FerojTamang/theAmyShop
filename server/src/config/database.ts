import { PrismaClient } from "../../generated/prisma/client.js";

type PrismaClientOptions = ConstructorParameters<typeof PrismaClient>[0];

export const prisma = new PrismaClient({} as PrismaClientOptions);

export const connectDatabase = async (): Promise<void> => {
  await prisma.$connect();
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};
