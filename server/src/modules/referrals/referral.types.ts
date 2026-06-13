import type { Prisma } from "../../../generated/prisma/client.js";

export type ReferralClient = Prisma.TransactionClient;

export type ReferralDirection = "MADE" | "RECEIVED";
