"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnvilService = void 0;
const debug_1 = __importDefault(require("debug"));
const errors_1 = require("hardhat/internal/core/errors");
const url_1 = require("url");
const anvil_server_1 = require("./anvil-server");
const log = (0, debug_1.default)("hardhat:plugin:anvil-service");
const DEFAULT_PORT = 7545;
class AnvilService {
    constructor(Anvil, options) {
        log("Initializing server");
        this._server = Anvil;
        this._options = options;
    }
    static getDefaultOptions() {
        return {
            url: `http://127.0.0.1:${DEFAULT_PORT}`,
            gasPrice: 20000000000,
            gasLimit: 6721975,
            defaultBalanceEther: 100,
            totalAccounts: 10,
            allowUnlimitedContractSize: false,
            locked: false,
            hdPath: "m/44'/60'/0'/0/",
            mnemonic: "test test test test test test test test test test test junk",
            launch: true
        };
    }
    static async create(options) {
        // Get and initialize option validator
        const { default: optionsSchema } = await Promise.resolve().then(() => __importStar(require("./anvil-options-ti")));
        const { createCheckers } = await Promise.resolve().then(() => __importStar(require("ts-interface-checker")));
        const { AnvilOptionsTi } = createCheckers(optionsSchema);
        AnvilService.optionValidator = AnvilOptionsTi;
        // TODO validate options
        //  // Validate and Transform received options before initialize server
        //  this._options = this._validateAndTransformOptions(options);
        const Anvil = anvil_server_1.AnvilServer.launch(options);
        return new AnvilService(Anvil, options);
    }
    _validateAndTransformOptions(options) {
        const validatedOptions = options;
        // Validate and parse hostname and port from URL (this validation is priority)
        const url = new url_1.URL(options.url);
        if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
            throw new errors_1.NomicLabsHardhatPluginError("@nomiclabs/hardhat-anvil", "Anvil network only works with localhost");
        }
        // Validate all options agains validator
        try {
            AnvilService.optionValidator.check(options);
        }
        catch (e) {
            throw new errors_1.NomicLabsHardhatPluginError("@nomiclabs/hardhat-anvil", `Anvil network config is invalid: ${e.message}`, e);
        }
        // Test for unsupported commands
        if (options.accounts !== undefined) {
            throw new errors_1.NomicLabsHardhatPluginError("@nomiclabs/hardhat-anvil", "Config: anvil.accounts unsupported for this network");
        }
        // Transform needed options to Anvil core server (not using SnakeCase lib for performance)
        validatedOptions.hostname = url.hostname;
        validatedOptions.port =
            url.port !== undefined && url.port !== ""
                ? parseInt(url.port, 10)
                : DEFAULT_PORT;
        const optionsToInclude = [
            "accountsKeyPath",
            "dbPath",
            "defaultBalanceEther",
            "totalAccounts",
            "unlockedAccounts",
        ];
        for (const [key, value] of Object.entries(options)) {
            if (value !== undefined && optionsToInclude.includes(key)) {
                validatedOptions[this._snakeCase(key)] = value;
                delete validatedOptions[key];
            }
        }
        return validatedOptions;
    }
    stopServer() {
        this._server.kill();
    }
    _snakeCase(str) {
        return str.replace(/([A-Z]){1}/g, (match) => `_${match.toLowerCase()}`);
    }
}
exports.AnvilService = AnvilService;
//# sourceMappingURL=anvil-service.js.map