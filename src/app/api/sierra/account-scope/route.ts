import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import {
  partitionActivityLogs,
  resolveCurrentSierraAccount,
} from "@/domain/sierraAccountScope";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const defaultSierraDirectory = "C:\\SierraChart";

export async function GET() {
  try {
    const sierraDirectory = path.resolve(
      /* turbopackIgnore: true */ process.env.SIERRA_CHART_DIR?.trim() || defaultSierraDirectory,
    );
    const accountDirectory = path.join(sierraDirectory, "TradeAccountData");
    const activityDirectory = path.join(sierraDirectory, "TradeActivityLogs");

    const accountEntries = await readdir(accountDirectory, { withFileTypes: true });
    const accountFiles = await Promise.all(accountEntries
      .filter((entry) => entry.isFile() && entry.name.startsWith("TradeAccountData_") && entry.name.endsWith(".data"))
      .map(async (entry) => ({
        name: entry.name,
        modifiedAtMs: (await stat(path.join(accountDirectory, entry.name))).mtimeMs,
      })));

    const accountId = resolveCurrentSierraAccount(
      accountFiles,
      process.env.SIERRA_ACCOUNT_ID?.trim() || undefined,
    );

    if (!accountId) {
      return Response.json(
        { available: false, message: "No active Sierra trade account was found." },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    const activityEntries = await readdir(activityDirectory, { withFileTypes: true });
    const activityFiles = activityEntries.filter((entry) => entry.isFile()).map((entry) => entry.name);
    const { matching, ignored } = partitionActivityLogs(activityFiles, accountId);

    return Response.json({
      available: true,
      accountId,
      selection: process.env.SIERRA_ACCOUNT_ID ? "configured" : "active_sierra_account",
      matchingActivityLogs: matching.length,
      ignoredActivityLogs: ignored.length,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      { available: false, message: "Sierra account scope is unavailable on this machine." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
