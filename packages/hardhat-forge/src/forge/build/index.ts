import { task, subtask } from "hardhat/config";
import { TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS } from "hardhat/builtin-tasks/task-names";
import camelcaseKeys = require("camelcase-keys");
import { NomicLabsHardhatPluginError } from "hardhat/internal/core/errors";
import { registerCompilerArgs, registerProjectPathArgs } from "../common";
import { ForgeBuildArgs, spawnBuild } from "./build";

// Allow the user to skip compiling tests if the `skipTests` config
// is set in the foundry config. This speeds up compilation time by a lot.
subtask(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS).setAction(
  async (_, hre, runSuper) => {
    const paths = await runSuper();

    if (hre.config.foundry?.skipTests!) {
      return paths.filter((p: string) => !p.endsWith(".t.sol"));
    }
    return paths;
  }
);

registerProjectPathArgs(registerCompilerArgs(task("compile")))
  .setDescription("Compiles the entire project with forge")
  .addFlag(
    "offline",
    "Do not access the network. Missing solc versions will not be installed."
  )
  .addFlag(
    "viaIr",
    "Use the Yul intermediate representation compilation pipeline."
  )
  .setAction(async (args, hre, runSuper) => {
    const input = { ...args, ...(hre.config.foundry || {}) };
    const buildArgs = await getCheckedArgs(input);
    await spawnBuild(buildArgs);
    if (hre.config.foundry?.runSuper!) {
      await runSuper(args);
    }
  });

async function getCheckedArgs(args: any): Promise<ForgeBuildArgs> {
  // Get and initialize option validator
  const { default: buildArgsSchema } = await import("./build-ti");
  const { default: compilerArgsSchema } = await import("../common/compiler-ti");
  const { default: projectPathsSchema } = await import(
    "../common/projectpaths-ti"
  );
  const { createCheckers } = await import("ts-interface-checker");
  const { ForgeBuildArgsTi } = createCheckers(
    buildArgsSchema,
    compilerArgsSchema,
    projectPathsSchema
  );
  const uncheckedBuildArgs = camelcaseKeys(args);
  // Validate all options against the validator
  try {
    ForgeBuildArgsTi.check(uncheckedBuildArgs);
  } catch (e: any) {
    throw new NomicLabsHardhatPluginError(
      "@foundry-rs/hardhat-forge",
      `Forge build config is invalid: ${e.message}`,
      e
    );
  }
  return uncheckedBuildArgs as ForgeBuildArgs;
}
