// bindings for common env settings

/**
 * Mirrors the `forge build` arguments
 */
export declare interface ForgeEnvArgs {
  gasLimit?: number;
  chainId?: number;
  gasPrice?: string | number;
  txOrigin?: string;
  blockCoinbase?: string;
  blockTimestamp?: number;
  blockNumber?: number;
  blockDifficulty?: number;
  blockGasLimit?: number;
}

/**
 * Transforms the `ForgeEnvArgs` in to a list of command arguments
 * @param args
 */
export function envArgs(args: ForgeEnvArgs): string[] {
  const allArgs: string[] = [];

  const gasLimit = args.gasLimit ?? -1;
  if (gasLimit >= 0) {
    allArgs.push("--gas-limit", gasLimit.toString());
  }

  const chainId = args.chainId ?? -1;
  if (chainId >= 0) {
    allArgs.push("--chain-id", chainId.toString());
  }

  const gasPrice = args.gasPrice ?? -1;
  if (gasPrice >= 0) {
    allArgs.push("--gas-price", gasPrice.toString());
  }

  const txOrigin = args.txOrigin ?? "";
  if (txOrigin) {
    allArgs.push("--tx-origin", txOrigin);
  }

  const blockCoinbase = args.blockCoinbase ?? "";
  if (blockCoinbase) {
    allArgs.push("--block-coinbase", blockCoinbase);
  }

  const blockTimestamp = args.blockTimestamp ?? -1;
  if (blockTimestamp >= 0) {
    allArgs.push("--block-timestamp", blockTimestamp.toString());
  }

  const blockNumber = args.blockNumber ?? -1;
  if (blockNumber >= 0) {
    allArgs.push("--block-number", blockNumber.toString());
  }

  const blockDifficulty = args.blockDifficulty ?? -1;
  if (blockDifficulty >= 0) {
    allArgs.push("--block-difficulty", blockDifficulty.toString());
  }

  const blockGasLimit = args.blockGasLimit ?? -1;
  if (blockGasLimit >= 0) {
    allArgs.push("--block-gas-limit", blockGasLimit.toString());
  }

  return allArgs;
}
