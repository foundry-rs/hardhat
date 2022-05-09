// bindings for common project paths settings

/**
 * Mirrors the `ProjectPaths` type
 */
export declare interface ProjectPathArgs {
  root?: string;
  contracts?: string;
  remappings?: string[];
  remappingsEnv?: string;
  cachePath?: string;
  libPaths?: string;
  hardhat?: boolean;
  configPath?: string;
  outPath?: string;
}

export function projectPathsArgs(args: ProjectPathArgs): string[] {
  const allArgs: string[] = [];

  const root = args.root ?? "";
  if (root) {
    allArgs.push("--root", root);
  }
  const contracts = args.contracts ?? "";
  if (contracts) {
    allArgs.push("--contracts", contracts);
  }
  if (args.remappings && args.remappings.length) {
    allArgs.push("--remappings", ...args.remappings);
  }
  const remappingsEnv = args.remappingsEnv ?? "";
  if (remappingsEnv) {
    allArgs.push("--remappings-env", remappingsEnv);
  }
  const cachePath = args.cachePath ?? "";
  if (cachePath) {
    allArgs.push("--cache-path", cachePath);
  }
  const libPaths = args.libPaths ?? "";
  if (libPaths) {
    allArgs.push("--lib-paths", libPaths);
  }
  if (args.hardhat === true) {
    allArgs.push("--hardhat");
  }
  const configPath = args.configPath ?? "";
  if (configPath) {
    allArgs.push("--config-path", configPath);
  }
  const outPath = args.outPath ?? "";
  if (outPath) {
    allArgs.push("--out", outPath);
  }

  return allArgs;
}
