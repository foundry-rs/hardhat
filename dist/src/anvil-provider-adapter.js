"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnvilProviderAdapter = void 0;
const ethers_1 = require("ethers");
const util_1 = require("hardhat/internal/core/providers/util");
const plugins_1 = require("hardhat/plugins");
const constants_1 = require("./constants");
// This class is an extension of hardhat-ethers' wrapper.
class AnvilProviderAdapter extends ethers_1.providers.JsonRpcProvider {
    constructor(_hardhatNetwork) {
        super();
        this._hardhatNetwork = _hardhatNetwork;
    }
    getWallets() {
        if (this._hardhatNetwork.name !== "anvil") {
            throw new plugins_1.NomicLabsHardhatPluginError(constants_1.pluginName, `This method only works with Anvil.
You can use \`await hre.ethers.getSigners()\` in other networks.`);
        }
        const networkConfig = this._hardhatNetwork.config;
        return (0, util_1.normalizeHardhatNetworkAccountsConfig)(networkConfig.accounts).map((acc) => new ethers_1.Wallet(acc.privateKey, this));
    }
    createEmptyWallet() {
        return ethers_1.Wallet.createRandom().connect(this);
    }
    // Copied from hardhat-ethers
    async send(method, params) {
        const result = await this._hardhatNetwork.provider.send(method, params);
        // We replicate ethers' behavior.
        this.emit("debug", {
            action: "send",
            request: {
                id: 42,
                jsonrpc: "2.0",
                method,
                params,
            },
            response: result,
            provider: this,
        });
        return result;
    }
}
exports.AnvilProviderAdapter = AnvilProviderAdapter;
//# sourceMappingURL=anvil-provider-adapter.js.map