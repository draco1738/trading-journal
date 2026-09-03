export type SierraAccountFile = {
  name: string;
  modifiedAtMs: number;
};

const accountFilePattern = /^TradeAccountData_(.+)\.data$/;

export function accountIdFromDataFile(fileName: string) {
  return accountFilePattern.exec(fileName)?.[1] ?? null;
}

export function resolveCurrentSierraAccount(
  accountFiles: SierraAccountFile[],
  configuredAccountId?: string,
) {
  const available = accountFiles
    .map((file) => ({ ...file, accountId: accountIdFromDataFile(file.name) }))
    .filter((file): file is SierraAccountFile & { accountId: string } => Boolean(file.accountId));

  if (configuredAccountId) {
    const configured = available.find(({ accountId }) => accountId === configuredAccountId);
    if (!configured) {
      throw new Error(`Configured Sierra account is not active: ${configuredAccountId}`);
    }
    return configured.accountId;
  }

  return available.sort((left, right) => right.modifiedAtMs - left.modifiedAtMs)[0]?.accountId ?? null;
}

export function activityLogBelongsToAccount(fileName: string, accountId: string) {
  return fileName.startsWith("TradeActivityLog_") && fileName.endsWith(`.${accountId}.data`);
}

export function partitionActivityLogs(fileNames: string[], accountId: string) {
  const matching: string[] = [];
  const ignored: string[] = [];

  for (const fileName of fileNames) {
    if (activityLogBelongsToAccount(fileName, accountId)) matching.push(fileName);
    else ignored.push(fileName);
  }

  return { matching, ignored };
}
