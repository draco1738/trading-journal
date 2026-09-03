import Decimal from "decimal.js";

export type FillSide = "buy" | "sell";

export type ExecutionFill = {
  sourceExecutionId: string;
  accountId: string;
  instrumentId: string;
  side: FillSide;
  quantity: Decimal.Value;
  price: Decimal.Value;
  executedAt: string;
  commission?: Decimal.Value;
  fees?: Decimal.Value;
  contractMultiplier?: Decimal.Value;
};

export type FillAllocation = {
  sourceExecutionId: string;
  role: "open" | "close";
  quantity: number;
};

export type ReconstructedTrade = {
  accountId: string;
  instrumentId: string;
  direction: "long" | "short";
  openedAt: string;
  closedAt: string;
  openedQuantity: number;
  closedQuantity: number;
  averageEntry: number;
  averageExit: number;
  grossPnl: number;
  commissions: number;
  fees: number;
  netPnl: number;
  allocations: FillAllocation[];
};

export type OpenPosition = Omit<
  ReconstructedTrade,
  "closedAt" | "closedQuantity" | "averageExit" | "grossPnl" | "netPnl"
> & {
  openQuantity: number;
};

type Lot = { side: FillSide; quantity: Decimal; price: Decimal };
type Cycle = {
  accountId: string;
  instrumentId: string;
  direction: "long" | "short";
  openedAt: string;
  entryQuantity: Decimal;
  entryNotional: Decimal;
  exitQuantity: Decimal;
  exitNotional: Decimal;
  grossPnl: Decimal;
  commissions: Decimal;
  fees: Decimal;
  allocations: FillAllocation[];
  lots: Lot[];
  multiplier: Decimal;
};

const zero = () => new Decimal(0);

function sideDirection(side: FillSide): "long" | "short" {
  return side === "buy" ? "long" : "short";
}

function addAllocation(
  allocations: FillAllocation[],
  sourceExecutionId: string,
  role: "open" | "close",
  quantity: Decimal,
) {
  const existing = allocations.find(
    (allocation) =>
      allocation.sourceExecutionId === sourceExecutionId && allocation.role === role,
  );
  if (existing) existing.quantity = new Decimal(existing.quantity).plus(quantity).toNumber();
  else allocations.push({ sourceExecutionId, role, quantity: quantity.toNumber() });
}

function newCycle(fill: ExecutionFill): Cycle {
  return {
    accountId: fill.accountId,
    instrumentId: fill.instrumentId,
    direction: sideDirection(fill.side),
    openedAt: fill.executedAt,
    entryQuantity: zero(),
    entryNotional: zero(),
    exitQuantity: zero(),
    exitNotional: zero(),
    grossPnl: zero(),
    commissions: zero(),
    fees: zero(),
    allocations: [],
    lots: [],
    multiplier: new Decimal(fill.contractMultiplier ?? 1),
  };
}

function allocateCosts(cycle: Cycle, fill: ExecutionFill, quantity: Decimal) {
  const fillQuantity = new Decimal(fill.quantity);
  const ratio = quantity.div(fillQuantity);
  cycle.commissions = cycle.commissions.plus(new Decimal(fill.commission ?? 0).mul(ratio));
  cycle.fees = cycle.fees.plus(new Decimal(fill.fees ?? 0).mul(ratio));
}

function addOpeningQuantity(cycle: Cycle, fill: ExecutionFill, quantity: Decimal) {
  const price = new Decimal(fill.price);
  cycle.lots.push({ side: fill.side, quantity, price });
  cycle.entryQuantity = cycle.entryQuantity.plus(quantity);
  cycle.entryNotional = cycle.entryNotional.plus(price.mul(quantity));
  allocateCosts(cycle, fill, quantity);
  addAllocation(cycle.allocations, fill.sourceExecutionId, "open", quantity);
}

function closeQuantity(cycle: Cycle, fill: ExecutionFill, quantity: Decimal) {
  let remaining = quantity;
  const exitPrice = new Decimal(fill.price);

  while (remaining.gt(0)) {
    const lot = cycle.lots[0];
    if (!lot) throw new Error("Cannot close an empty position");
    const matched = Decimal.min(remaining, lot.quantity);
    const points = lot.side === "buy"
      ? exitPrice.minus(lot.price)
      : lot.price.minus(exitPrice);

    cycle.grossPnl = cycle.grossPnl.plus(points.mul(matched).mul(cycle.multiplier));
    cycle.exitQuantity = cycle.exitQuantity.plus(matched);
    cycle.exitNotional = cycle.exitNotional.plus(exitPrice.mul(matched));
    lot.quantity = lot.quantity.minus(matched);
    remaining = remaining.minus(matched);
    if (lot.quantity.eq(0)) cycle.lots.shift();
  }

  allocateCosts(cycle, fill, quantity);
  addAllocation(cycle.allocations, fill.sourceExecutionId, "close", quantity);
}

function finishCycle(cycle: Cycle, closedAt: string): ReconstructedTrade {
  const totalCosts = cycle.commissions.plus(cycle.fees);
  return {
    accountId: cycle.accountId,
    instrumentId: cycle.instrumentId,
    direction: cycle.direction,
    openedAt: cycle.openedAt,
    closedAt,
    openedQuantity: cycle.entryQuantity.toNumber(),
    closedQuantity: cycle.exitQuantity.toNumber(),
    averageEntry: cycle.entryNotional.div(cycle.entryQuantity).toNumber(),
    averageExit: cycle.exitNotional.div(cycle.exitQuantity).toNumber(),
    grossPnl: cycle.grossPnl.toNumber(),
    commissions: cycle.commissions.toNumber(),
    fees: cycle.fees.toNumber(),
    netPnl: cycle.grossPnl.minus(totalCosts).toNumber(),
    allocations: cycle.allocations,
  };
}

export function reconstructTrades(fills: ExecutionFill[]) {
  const completedTrades: ReconstructedTrade[] = [];
  const states = new Map<string, Cycle>();
  const ordered = [...fills].sort((left, right) =>
    left.executedAt.localeCompare(right.executedAt) ||
    left.sourceExecutionId.localeCompare(right.sourceExecutionId),
  );

  for (const fill of ordered) {
    const fillQuantity = new Decimal(fill.quantity);
    const fillPrice = new Decimal(fill.price);
    if (fillQuantity.lte(0) || fillPrice.isNegative()) {
      throw new Error(`Invalid execution ${fill.sourceExecutionId}`);
    }

    const key = `${fill.accountId}:${fill.instrumentId}`;
    let cycle = states.get(key);
    let remaining = fillQuantity;

    while (remaining.gt(0)) {
      if (!cycle) {
        cycle = newCycle(fill);
        states.set(key, cycle);
      }

      const currentSide = cycle.lots[0]?.side;
      if (!currentSide || currentSide === fill.side) {
        addOpeningQuantity(cycle, fill, remaining);
        remaining = zero();
        continue;
      }

      const openQuantity = cycle.lots.reduce(
        (sum, lot) => sum.plus(lot.quantity),
        zero(),
      );
      const closing = Decimal.min(remaining, openQuantity);
      closeQuantity(cycle, fill, closing);
      remaining = remaining.minus(closing);

      if (cycle.lots.length === 0) {
        completedTrades.push(finishCycle(cycle, fill.executedAt));
        states.delete(key);
        cycle = undefined;
      }
    }
  }

  const openPositions: OpenPosition[] = Array.from(states.values()).map((cycle) => {
    const openQuantity = cycle.lots.reduce((sum, lot) => sum.plus(lot.quantity), zero());
    const openNotional = cycle.lots.reduce(
      (sum, lot) => sum.plus(lot.price.mul(lot.quantity)),
      zero(),
    );
    return {
      accountId: cycle.accountId,
      instrumentId: cycle.instrumentId,
      direction: cycle.direction,
      openedAt: cycle.openedAt,
      openedQuantity: cycle.entryQuantity.toNumber(),
      averageEntry: openNotional.div(openQuantity).toNumber(),
      commissions: cycle.commissions.toNumber(),
      fees: cycle.fees.toNumber(),
      allocations: cycle.allocations,
      openQuantity: openQuantity.toNumber(),
    };
  });

  return { completedTrades, openPositions };
}
