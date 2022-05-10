import debug from "debug";
import { TASK_RUN, TASK_TEST } from "hardhat/builtin-tasks/task-names";
import { extendConfig, task, extendEnvironment } from "hardhat/config";
import {
  HardhatRuntimeEnvironment,
  RunSuperFunction,
  TaskArguments,
} from "hardhat/types";
import { lazyObject } from "hardhat/plugins";
import { getDeployMockContract, hardhatDeployContract } from "./deploy";
import { getLinkFunction } from "./link";
import { initializeWaffleMatchers } from "./matchers";
import "./type-extensions";

const log = debug("hardhat:plugin:anvil");

import { AnvilService } from "./anvil-service";

extendEnvironment((hre) => {
  // This mimics the `hardhat-waffle` plugin so that it works as replacement for
  // it this is currently necessary because the waffle plugin is bound to a network
  // with the name `hardhat`
  (hre as any).waffle = lazyObject(() => {
    const { AnvilProviderAdapter } = require("./anvil-provider-adapter");

    const { hardhatCreateFixtureLoader } = require("./fixtures");

    const anvilWaffleProvider = new AnvilProviderAdapter(hre.network) as any;

    return {
      provider: anvilWaffleProvider,
      deployContract: hardhatDeployContract.bind(undefined, hre),
      deployMockContract: getDeployMockContract(),
      solidity: require("./waffle-chai").waffleChai,
      createFixtureLoader: hardhatCreateFixtureLoader.bind(
        undefined,
        anvilWaffleProvider
      ),
      loadFixture: hardhatCreateFixtureLoader(anvilWaffleProvider),
      link: getLinkFunction(),
    };
  });

  initializeWaffleMatchers(hre.config.paths.root);
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
  // make compatible with the hardhat accounts object used by the waffleprovider
  resolvedConfig.networks.anvil.accounts = {
    mnemonic: resolvedConfig.networks.anvil.mnemonic,
    path: resolvedConfig.networks.anvil.hdPath,
    initialIndex: 0,
    count: resolvedConfig.networks.anvil.totalAccounts,
    passphrase: "",
  };
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

  let ret;
  try {
    ret = await runSuper();
  } catch (error) {
    log("Stopping Anvil after error");
    anvilService.stopServer();
    throw error;
  }

  log("Stopping Anvil");
  anvilService.stopServer();

  return ret;
}
