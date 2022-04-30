import debug from "debug";
import { TASK_RUN, TASK_TEST } from "hardhat/builtin-tasks/task-names";
import { extendConfig, task, extendEnvironment } from "hardhat/config";
import {
  HardhatRuntimeEnvironment,
  RunSuperFunction,
  TaskArguments,
} from "hardhat/types";
import { lazyObject } from "hardhat/plugins";

const log = debug("hardhat:plugin:anvil");

import { AnvilService } from "./anvil-service";
import { AnvilProviderAdapter } from "./anvil-provider-adapter";

extendEnvironment((hre) => {
  // This mimics the `hardhat-waffle` plugin so that it works as replacement for 
  // it this is currently necessary because the waffle plugin is bound to a network
  // with the name `hardhat`
  (hre as any).waffle = lazyObject(() => {
    const hardhatAnvilProvider = new AnvilProviderAdapter(
      hre.network
    ) as any;

    return {
      provider: hardhatAnvilProvider,
    };
  });
});

task(TASK_TEST, async (_args, env, runSuper) => {
  return handlePluginTask(env, runSuper);
});

task(TASK_RUN, async (_args, env, runSuper) => {
  return handlePluginTask(env, runSuper);
});

extendConfig((resolvedConfig: any, config: any) => {
  const defaultOptions = AnvilService.getDefaultOptions();

  if (config.networks && config.networks.anvil) {
    const customOptions = config.networks.anvil;
    resolvedConfig.networks.anvil = { ...defaultOptions, ...customOptions };
  } else {
    resolvedConfig.networks.anvil = defaultOptions;
  }
});

async function handlePluginTask(
  env: HardhatRuntimeEnvironment,
  runSuper: RunSuperFunction<TaskArguments>
) {
  if (env.network.name !== "anvil") {
    return runSuper();
  }

  log("Starting Anvil");

  const options = env.network.config;
  const anvilService = await AnvilService.create(options);

  const ret = await runSuper();

  log("Stopping Anvil");
  anvilService.stopServer();

  return ret;
}
