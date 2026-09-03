import { describe, expect, it } from "vitest";

import { reconstructTrades, type ExecutionFill } from "./reconstruct";

const base = {
  accountId: "sierra-main",
  instrumentId: "NQZ6",
  contractMultiplier: 20,
};

function fill(
  sourceExecutionId: string,
  side: "buy" | "sell",
  quantity: number,
  price: number,
  executedAt: string,
  extra: Partial<ExecutionFill> = {},
): ExecutionFill {
  return { ...base, sourceExecutionId, side, quantity, price, executedAt, ...extra };
}

describe("reconstructTrades", () => {
  it("reconstructs partial fills and scaled exits with FIFO P&L", () => {
    const result = reconstructTrades([
      fill("1", "buy", 1, 100, "2026-09-02T13:45:00Z", { commission: 1 }),
      fill("2", "buy", 1, 102, "2026-09-02T13:46:00Z", { commission: 1 }),
      fill("3", "sell", 1, 105, "2026-09-02T14:00:00Z", { commission: 1 }),
      fill("4", "sell", 1, 103, "2026-09-02T14:10:00Z", { commission: 1 }),
    ]);

    expect(result.openPositions).toHaveLength(0);
    expect(result.completedTrades).toHaveLength(1);
    expect(result.completedTrades[0]).toMatchObject({
      direction: "long",
      openedQuantity: 2,
      closedQuantity: 2,
      averageEntry: 101,
      averageExit: 104,
      grossPnl: 120,
      commissions: 4,
      netPnl: 116,
    });
  });

  it("splits a reversal into one closed trade and a new opposite position", () => {
    const result = reconstructTrades([
      fill("1", "buy", 2, 100, "2026-09-02T14:00:00Z"),
      fill("2", "sell", 3, 105, "2026-09-02T14:05:00Z", { commission: 3 }),
    ]);

    expect(result.completedTrades[0]).toMatchObject({
      direction: "long",
      grossPnl: 200,
      commissions: 2,
    });
    expect(result.openPositions[0]).toMatchObject({
      direction: "short",
      openQuantity: 1,
      averageEntry: 105,
      commissions: 1,
    });
  });

  it("keeps accounts isolated and carries positions overnight", () => {
    const result = reconstructTrades([
      fill("1", "sell", 1, 25000, "2026-09-02T20:59:00Z"),
      fill("2", "buy", 1, 24990, "2026-09-03T13:31:00Z"),
      fill("3", "buy", 1, 5000, "2026-09-03T13:31:00Z", { accountId: "ibkr-main", instrumentId: "ESZ6", contractMultiplier: 50 }),
    ]);

    expect(result.completedTrades[0]).toMatchObject({ direction: "short", grossPnl: 200 });
    expect(result.openPositions[0]).toMatchObject({ accountId: "ibkr-main", instrumentId: "ESZ6", openQuantity: 1 });
  });

  it("rejects non-positive quantities", () => {
    expect(() => reconstructTrades([
      fill("bad", "buy", 0, 100, "2026-09-03T13:30:00Z"),
    ])).toThrow("Invalid execution bad");
  });
});
