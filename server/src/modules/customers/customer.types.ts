import type { AccountStatus } from "../../../generated/prisma/client.js";

export type CustomerStatusUpdate = {
  status: AccountStatus;
};
