import { extendConfig, extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";

import { subtask, task } from "hardhat/config";

task("build")
  .setDescription("Compiles the entire project with forge")
  .addFlag("force", "Clear the cache and artifacts folder and recompile.")
  .setAction(async function (args, hre, runSuper) {
    return null;
  });
