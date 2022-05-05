"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const config_1 = require("hardhat/config");
const plugins_1 = require("hardhat/plugins");
const deploy_1 = require("./deploy");
const link_1 = require("./link");
const matchers_1 = require("./matchers");
require("./type-extensions");
const log = (0, debug_1.default)("hardhat:plugin:anvil");
const anvil_service_1 = require("./anvil-service");
(0, config_1.extendEnvironment)((hre) => {
    // This mimics the `hardhat-waffle` plugin so that it works as replacement for 
    // it this is currently necessary because the waffle plugin is bound to a network
    // with the name `hardhat`
    hre.waffle = (0, plugins_1.lazyObject)(() => {
        const { AnvilProviderAdapter } = require("./anvil-provider-adapter");
        const { hardhatCreateFixtureLoader } = require("./fixtures");
        const anvilWaffleProvider = new AnvilProviderAdapter(hre.network);
        return {
            provider: anvilWaffleProvider,
            deployContract: deploy_1.hardhatDeployContract.bind(undefined, hre),
            deployMockContract: (0, deploy_1.getDeployMockContract)(),
            solidity: require("./waffle-chai").waffleChai,
            createFixtureLoader: hardhatCreateFixtureLoader.bind(undefined, anvilWaffleProvider),
            loadFixture: hardhatCreateFixtureLoader(anvilWaffleProvider),
            link: (0, link_1.getLinkFunction)(),
        };
    });
    (0, matchers_1.initializeWaffleMatchers)(hre.config.paths.root);
});
(0, config_1.task)(task_names_1.TASK_TEST, async (_args, env, runSuper) => {
    return handlePluginTask(env, runSuper);
});
(0, config_1.task)(task_names_1.TASK_RUN, async (_args, env, runSuper) => {
    return handlePluginTask(env, runSuper);
});
(0, config_1.extendConfig)((resolvedConfig, config) => {
    const defaultOptions = anvil_service_1.AnvilService.getDefaultOptions();
    if (config.networks && config.networks.anvil) {
        const customOptions = config.networks.anvil;
        resolvedConfig.networks.anvil = Object.assign(Object.assign({}, defaultOptions), customOptions);
    }
    else {
        resolvedConfig.networks.anvil = defaultOptions;
    }
    // make compatible with the hardhat accounts object used by the waffleprovider
    resolvedConfig.networks.anvil.accounts = {
        mnemonic: resolvedConfig.networks.anvil.mnemonic,
        path: resolvedConfig.networks.anvil.hdPath,
        initialIndex: 0,
        count: resolvedConfig.networks.anvil.totalAccounts,
        passphrase: ""
    };
});
async function handlePluginTask(env, runSuper) {
    if (env.network.name !== "anvil") {
        return runSuper();
    }
    log("Starting Anvil");
    const options = env.network.config;
    const anvilService = await anvil_service_1.AnvilService.create(options);
    let ret;
    try {
        ret = await runSuper();
    }
    catch (error) {
        log("Stopping Anvil after error");
        anvilService.stopServer();
        throw error;
    }
    log("Stopping Anvil");
    anvilService.stopServer();
    return ret;
}
//# sourceMappingURL=index.js.map