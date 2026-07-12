import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/database.js", async () => {
  const { prismaMock } = await import("../helpers/prismaMock.js");
  return { prisma: prismaMock };
});

import { OrderStatus } from "../../generated/prisma/client.js";
import { updateAdminOrderStatus } from "../../src/modules/orders/order.service.js";
import {
  createCheckoutTransactionMock,
  mockInteractiveTransaction,
} from "../helpers/prismaMock.js";

describe("admin order status transitions", () => {
  let tx: ReturnType<typeof createCheckoutTransactionMock>;

  beforeEach(() => {
    tx = createCheckoutTransactionMock();
    mockInteractiveTransaction(tx);
  });

  it("applies a valid transition and creates status history", async () => {
    tx.order.findUnique.mockResolvedValue({
      id: "order-1",
      orderStatus: OrderStatus.PENDING,
    });
    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.orderStatusHistory.create.mockResolvedValue({ id: "history-1" });
    tx.order.findUniqueOrThrow.mockResolvedValue({
      id: "order-1",
      orderStatus: OrderStatus.CONFIRMED,
    });

    const result = await updateAdminOrderStatus("admin-1", "order-1", {
      orderStatus: OrderStatus.CONFIRMED,
      note: "Confirmed in regression test",
    });

    expect(result).toMatchObject({ orderStatus: OrderStatus.CONFIRMED });
    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: "order-1",
        orderStatus: OrderStatus.PENDING,
      },
      data: { orderStatus: OrderStatus.CONFIRMED },
    });
    expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
      data: {
        orderId: "order-1",
        oldStatus: OrderStatus.PENDING,
        newStatus: OrderStatus.CONFIRMED,
        changedByUserId: "admin-1",
        note: "Confirmed in regression test",
      },
    });
  });

  it("rejects a backward transition from delivered to pending", async () => {
    tx.order.findUnique.mockResolvedValue({
      id: "order-1",
      orderStatus: OrderStatus.DELIVERED,
    });

    await expect(
      updateAdminOrderStatus("admin-1", "order-1", {
        orderStatus: OrderStatus.PENDING,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid order status transition from DELIVERED to PENDING.",
    });

    expect(tx.order.updateMany).not.toHaveBeenCalled();
    expect(tx.orderStatusHistory.create).not.toHaveBeenCalled();
  });

  it.each([OrderStatus.CANCELLED, OrderStatus.RETURNED])(
    "keeps %s terminal",
    async (terminalStatus) => {
      tx.order.findUnique.mockResolvedValue({
        id: "order-1",
        orderStatus: terminalStatus,
      });

      await expect(
        updateAdminOrderStatus("admin-1", "order-1", {
          orderStatus: OrderStatus.CONFIRMED,
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: `Invalid order status transition from ${terminalStatus} to CONFIRMED.`,
      });

      expect(tx.order.updateMany).not.toHaveBeenCalled();
      expect(tx.orderStatusHistory.create).not.toHaveBeenCalled();
    },
  );
});
