import { extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import path from "path";
import {
  ForgeArtifacts,
  SOLIDITY_FILES_CACHE_FILENAME,
  spawnConfig,
} from "./forge";

export * from "./task-names";
export * as forge from "./forge";

extendEnvironment((hre) => {
  // patches the default artifacts handler
  (hre as any).artifacts = lazyObject(() => {
    return spawnConfig().then((config) => {
      // read the foundry config and set the paths
      const outDir = path.join(hre.config.paths.root, config.out);
      const cacheDir = path.join(
        hre.config.paths.root,
        config.cache_path ?? "cache",
        SOLIDITY_FILES_CACHE_FILENAME
      );
      return new ForgeArtifacts(outDir, cacheDir);
    });
  });
});
