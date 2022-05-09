// bindings for forge build

import { compilerArgs, CompilerArgs } from "./compiler";
import { ProjectPathArgs, projectPathsArgs } from "./projectpaths";

/**
 * Mirrors the `forge build` arguments
 */
export declare interface ForgeBuildArgs extends CompilerArgs, ProjectPathArgs {
  force?: boolean;
  names?: boolean;
  sizes?: boolean;
  libraries?: string[];
  ignoredErrorCodes?: number[];
  noAutodetect?: boolean;
  useSolc?: string;
  offline?: boolean;
  viaIR?: boolean;
}

/**
 * Converts the `args` object into a list of arguments for the `forge build` command
 * @param args
 */
export function cliArgs(args: ForgeBuildArgs): string[] {
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
  if (args.viaIR === true) {
    allArgs.push("--via-ir");
  }

  allArgs.push(...compilerArgs(args));
  allArgs.push(...projectPathsArgs(args));

  return allArgs;
}
