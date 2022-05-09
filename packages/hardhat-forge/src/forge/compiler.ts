// bindings for common compiler settings

/**
 * Mirrors the `CompilerArgs` type
 */
export declare interface CompilerArgs {
  evmVersion?: string;
  optimize?: boolean;
  optimizerRuns?: number;
  extraOutput?: string[];
  extraOutputFiles?: string[];
}

export function compilerArgs(args: CompilerArgs): string[] {
  const allArgs: string[] = [];

  const evmVersion = args.evmVersion ?? "";
  if (evmVersion) {
    allArgs.push("--evm-version", evmVersion);
  }

  if (args.optimize === true) {
    allArgs.push("--optimize");
    const optimizerRuns = args.optimizerRuns ?? 0;
    if (optimizerRuns) {
      allArgs.push("--optimizer-runs", optimizerRuns.toString());
    }
  }

  if (args.extraOutput && args.extraOutput.length) {
    allArgs.push("--extra-output", ...args.extraOutput);
  }

  if (args.extraOutputFiles && args.extraOutputFiles.length) {
    allArgs.push("--extra-output-files", ...args.extraOutputFiles);
  }

  return allArgs;
}
