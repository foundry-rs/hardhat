// bindings for common evm settings

import { envArgs, ForgeEnvArgs } from "./env";

/**
 * EVM related args
 */
export declare interface ForgeEvmArgs extends ForgeEnvArgs {
  forkUrl?: string;
  forkBlockNumber?: number;
  noStorageCaching?: boolean;
  initialBalance?: string;
  sender?: string;
  ffi?: boolean;
  verbosity?: number;
}

/**
 * Transforms the `ForgeEvmArgs` in to a list of command arguments
 * @param args
 */
export function evmArgs(args: ForgeEvmArgs): string[] {
  const allArgs: string[] = [];

  const forkUrl = args.txOrigin ?? "";
  if (forkUrl) {
    allArgs.push("--fork-url", forkUrl);
    const forkBlockNumber = args.forkBlockNumber ?? -1;
    if (forkBlockNumber >= 0) {
      allArgs.push("--fork-block-number", forkBlockNumber.toString());
    }
  }

  if (args.noStorageCaching ?? false) {
    allArgs.push("--no-storage-caching");
  }

  const initialBalance = args.initialBalance ?? "";
  if (initialBalance) {
    allArgs.push("--initial-balance", initialBalance);
  }

  const sender = args.sender ?? "";
  if (sender) {
    allArgs.push("--sender", sender);
  }

  if (args.ffi ?? false) {
    allArgs.push("--ffi");
  }

  const verbosity = args.verbosity ?? -1;
  if (verbosity >= 0) {
    allArgs.push("--verbosity", verbosity.toString());
  }

  allArgs.push(...envArgs(args));

  return allArgs;
}
