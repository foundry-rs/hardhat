// bindings for forge test
import { spawn as spawn } from "child_process";
import { buildArgs, ForgeBuildArgs } from "../build/build";
import { ForgeEvmArgs } from "../common";

/**
 * Mirrors the `forge test` arguments
 */
export interface ForgeTestArgs extends ForgeBuildArgs, ForgeEvmArgs {
  json?: boolean;
  gasReport?: boolean;
  allowFailure?: boolean;
}

/** *
 * Invokes `forge build`
 * @param opts The arguments to pass to `forge build`
 */
export async function spawnBuild(opts: ForgeTestArgs): Promise<boolean> {
  const args = ["test", ...testArgs(opts)];
  return new Promise((resolve) => {
    const process = spawn("forge", args, {
      stdio: "inherit",
    });
    process.on("exit", (code) => {
      resolve(code === 0);
    });
  });
}

/**
 * Converts the `args` object into a list of arguments for the `forge test` command
 * @param args
 */
export function testArgs(args: ForgeTestArgs): string[] {
  const allArgs: string[] = [];
  if (args.force === true) {
    allArgs.push("--force");
  }
  if (args.names === true) {
    allArgs.push("--names");
  }
  if (args.sizes === true) {
    allArgs.push("--sizes");
  }
  if (args.libraries && args.libraries.length) {
    allArgs.push("--libraries", ...args.libraries);
  }
  if (args.ignoredErrorCodes && args.ignoredErrorCodes.length) {
    const codes = args.ignoredErrorCodes.map((code) => code.toString());
    allArgs.push("--ignored-error-codes", ...codes);
  }
  if (args.noAutodetect === true) {
    allArgs.push("--no-auto-detect");
  }
  const useSolc = args.useSolc ?? "";
  if (useSolc) {
    allArgs.push("--use", useSolc);
  }
  if (args.offline === true) {
    allArgs.push("--offline");
  }
  if (args.viaIr === true) {
    allArgs.push("--via-ir");
  }

  allArgs.push(...buildArgs(args));

  return allArgs;
}
