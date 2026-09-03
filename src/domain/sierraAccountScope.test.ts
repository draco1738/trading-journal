import { describe, expect, it } from "vitest";

import {
  activityLogBelongsToAccount,
  partitionActivityLogs,
  resolveCurrentSierraAccount,
} from "./sierraAccountScope";

const currentAccount = "LFE050-9YK0O54A-TEST002";

describe("Sierra account scope", () => {
  it("uses the most recently active Sierra account", () => {
    expect(resolveCurrentSierraAccount([
      { name: "TradeAccountData_LTE150-1P51LDE4-TEST003.data", modifiedAtMs: 10 },
      { name: `TradeAccountData_${currentAccount}.data`, modifiedAtMs: 20 },
    ])).toBe(currentAccount);
  });

  it("honors an explicit account only when Sierra exposes it", () => {
    const files = [
      { name: `TradeAccountData_${currentAccount}.data`, modifiedAtMs: 20 },
      { name: "TradeAccountData_LTE150-OW89E1X5-TEST004.data", modifiedAtMs: 10 },
    ];

    expect(resolveCurrentSierraAccount(files, "LTE150-OW89E1X5-TEST004")).toBe("LTE150-OW89E1X5-TEST004");
    expect(() => resolveCurrentSierraAccount(files, "unknown-account")).toThrow("not active");
  });

  it("matches only the exact current account and excludes None or other Lucid accounts", () => {
    expect(activityLogBelongsToAccount(`TradeActivityLog_2026-09-03_UTC.${currentAccount}.data`, currentAccount)).toBe(true);
    expect(activityLogBelongsToAccount("TradeActivityLog_2026-09-03_UTC.None.data", currentAccount)).toBe(false);
    expect(activityLogBelongsToAccount("TradeActivityLog_2026-09-03_UTC.LTE150-OW89E1X5-TEST004.data", currentAccount)).toBe(false);
    expect(activityLogBelongsToAccount(`TradeActivityLog_2026-09-03_UTC.${currentAccount}.simulated.data`, currentAccount)).toBe(false);
  });

  it("partitions the directory so rejected files can never reach ingestion", () => {
    const result = partitionActivityLogs([
      `TradeActivityLog_2026-09-03_UTC.${currentAccount}.data`,
      "TradeActivityLog_2026-09-03_UTC.None.data",
      "TradeActivityLog_2026-09-02_UTC.LTE150-OW89E1X5-TEST004.data",
    ], currentAccount);

    expect(result.matching).toEqual([`TradeActivityLog_2026-09-03_UTC.${currentAccount}.data`]);
    expect(result.ignored).toHaveLength(2);
  });
});
