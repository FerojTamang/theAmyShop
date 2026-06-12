import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { config } from "./env.js";

const adapter = new PrismaPg({
  connectionString: config.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });

export const connectDatabase = async (): Promise<void> => {
  await prisma.$connect();
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};
