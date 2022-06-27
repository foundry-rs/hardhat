import "./forge/types";
import { extendEnvironment, extendConfig } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import {
  HardhatConfig,
  HardhatUserConfig,
  HardhatRuntimeEnvironment,
} from "hardhat/types";
import path from "path";
import { ForgeArtifacts, spawnConfigSync } from "./forge";

export * from "./task-names";
export * as forge from "./forge";

extendEnvironment((hre: HardhatRuntimeEnvironment) => {
  // patches the default artifacts handler
  (hre as any).artifacts = lazyObject(() => {
    const config = spawnConfigSync();
    const outDir = path.join(hre.config.paths.root, config.out);
    // the build info directory is not currently configurable,
    // it will always be placed in out/build-info
    const buildInfoDir = path.join(outDir, "build-info");

    const artifacts = new ForgeArtifacts(
      hre.config.paths.root,
      outDir,
      hre.config.paths.artifacts,
      buildInfoDir,
      config.build_info
    );

    artifacts.writeArtifactsSync();
    return artifacts;
  });
});

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    config.foundry = userConfig.foundry || {};
  }
);
