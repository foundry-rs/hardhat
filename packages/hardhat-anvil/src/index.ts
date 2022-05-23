import debug from "debug";
import {
  TASK_NODE,
  TASK_NODE_GET_PROVIDER,
  TASK_RUN,
  TASK_TEST,
} from "hardhat/builtin-tasks/task-names";
import { extendConfig, extendEnvironment, subtask, task } from "hardhat/config";
import {
  EthereumProvider,
  HardhatRuntimeEnvironment,
  RunSuperFunction,
  TaskArguments,
} from "hardhat/types";
import { lazyObject } from "hardhat/plugins";
import { HardhatError } from "hardhat/internal/core/errors";
import { ERRORS } from "hardhat/internal/core/errors-list";
import { createProvider } from "hardhat/internal/core/providers/construction";
import { getDeployMockContract, hardhatDeployContract } from "./deploy";
import { getLinkFunction } from "./link";
import { initializeWaffleMatchers } from "./matchers";
import "./type-extensions";
import { AnvilService } from "./anvil-service";

export const ANVIL_NETWORK_NAME = "anvil";

const log = debug("hardhat:plugin:anvil");

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

task(TASK_NODE, "Starts Anvil RPC server").setAction(
  async (opts: any, { hardhatArguments, network }) => {
    // we throw if the user specified a network argument and it's not hardhat
    if (
      network.name !== ANVIL_NETWORK_NAME &&
      hardhatArguments.network !== undefined
    ) {
      throw new HardhatError(ERRORS.BUILTIN_TASKS.JSONRPC_UNSUPPORTED_NETWORK);
    }

    const args = await AnvilService.getCheckedArgs({
      ...AnvilService.getDefaultAccountConfig(),
      ...opts,
      ...network.config,
    });

    // launch anvil
    const server = await AnvilService.create(args, true);
    try {
      await server.waitUntilClosed();
    } catch (error) {
      if (HardhatError.isHardhatError(error)) {
        throw error;
      }

      if (error instanceof Error) {
        throw new HardhatError(
          ERRORS.BUILTIN_TASKS.JSONRPC_SERVER_ERROR,
          {
            error: error.message,
          },
          error
        );
      }

      // eslint-disable-next-line @nomiclabs/hardhat-internal-rules/only-hardhat-error
      throw error;
    }
  }
);

subtask(TASK_NODE_GET_PROVIDER).setAction(
  async (
    {
      forkBlockNumber: forkBlockNumberParam,
      forkUrl: forkUrlParam,
    }: {
      forkBlockNumber?: number;
      forkUrl?: string;
    },
    { artifacts, config, network, userConfig }
  ): Promise<EthereumProvider> => {
    let provider = network.provider;

    if (network.name !== ANVIL_NETWORK_NAME) {
      const networkConfig = config.networks[ANVIL_NETWORK_NAME];

      log(`Creating hardhat provider for JSON-RPC server`);
      provider = createProvider(
        ANVIL_NETWORK_NAME,
        networkConfig,
        config.paths,
        artifacts
      );
    }

    const anvilConfig = config.networks[ANVIL_NETWORK_NAME] as any;

    const forkUrlConfig = anvilConfig?.forking?.url;
    const forkBlockNumberConfig = anvilConfig?.forking?.blockNumber;

    const forkUrl = forkUrlParam ?? forkUrlConfig;
    const forkBlockNumber = forkBlockNumberParam ?? forkBlockNumberConfig;

    // we throw an error if the user specified a forkBlockNumber but not a
    // forkUrl
    if (forkBlockNumber !== undefined && forkUrl === undefined) {
      throw new HardhatError(
        ERRORS.BUILTIN_TASKS.NODE_FORK_BLOCK_NUMBER_WITHOUT_URL
      );
    }

    // if the url or the block is different to the one in the configuration,
    // we use hardhat_reset to set the fork
    if (
      forkUrl !== forkUrlConfig ||
      forkBlockNumber !== forkBlockNumberConfig
    ) {
      await provider.request({
        method: "anvil_reset",
        params: [
          {
            forking: {
              jsonRpcUrl: forkUrl,
              blockNumber: forkBlockNumber,
            },
          },
        ],
      });
    }

    const anvilUserConfig =
      userConfig.networks?.[ANVIL_NETWORK_NAME] ?? ({} as any);

    // enable logging
    await provider.request({
      method: "anvil_setLoggingEnabled",
      params: [anvilUserConfig?.loggingEnabled ?? true],
    });

    return provider;
  }
);

extendConfig((resolvedConfig: any, config: any) => {
  const defaultOptions = AnvilService.getDefaultAccountConfig();
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
