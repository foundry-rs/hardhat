import debug from "debug";
import { NomicLabsHardhatPluginError } from "hardhat/internal/core/errors";
import { URL } from "url";
import { AnvilServer } from "./anvil-server";

const log = debug("hardhat:plugin:anvil-service");

export declare interface AnvilOptions {
  url: string;
  accountKeysPath?: string; // Translates to: account_keys_path
  accounts?: object[];
  allowUnlimitedContractSize?: boolean;
  blockTime?: number;
  launch?: boolean; // whether to launch the server at all
  defaultBalanceEther?: number; // Translates to: default_balance_ether
  fork?: string | object;
  forkBlockNumber?: string | number; // Translates to: fork_block_number
  gasLimit?: number;
  gasPrice?: string | number;
  hdPath?: string; // Translates to: hd_path
  mnemonic?: string;
  path?: string; // path to the anvil exec
  locked?: boolean;
  noStorageCaching?: boolean;
  hardfork?: string;
  logger?: {
    log(msg: string): void;
  };
  chainId?: number;
  port?: number;
  totalAccounts?: number; // Translates to: total_accounts
  silent?: boolean;
  vmErrorsOnRPCResponse?: boolean;
  ws?: boolean;
}

const DEFAULT_PORT = 8545;

export class AnvilService {
  public static error?: Error;
  public static optionValidator: any;

  public static getDefaultOptions(): AnvilOptions {
    return {
      url: `http://127.0.0.1:${DEFAULT_PORT}`,
      gasPrice: 20000000000,
      gasLimit: 6721975,
      launch: true,
    };
  }

  public static async create(options: any): Promise<AnvilService> {
    // Get and initialize option validator
    const { default: optionsSchema } = await import("./anvil-options-ti");
    const { createCheckers } = await import("ts-interface-checker");
    const { AnvilOptionsTi } = createCheckers(optionsSchema);
    AnvilService.optionValidator = AnvilOptionsTi;

    const Anvil = AnvilServer.launch(options);

    return new AnvilService(Anvil, options);
  }

  private readonly _server: any;
  private readonly _options: any;

  private constructor(Anvil: any, options: any) {
    log("Initializing server");
    this._server = Anvil;
    this._options = options;
  }

  private _validateAndTransformOptions(options: AnvilOptions): any {
    const validatedOptions: any = options;

    // Validate and parse hostname and port from URL (this validation is priority)
    const url = new URL(options.url);
    if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      throw new NomicLabsHardhatPluginError(
        "@nomiclabs/hardhat-anvil",
        "Anvil network only works with localhost"
      );
    }

    // Validate all options agains validator
    try {
      AnvilService.optionValidator.check(options);
    } catch (e: any) {
      throw new NomicLabsHardhatPluginError(
        "@nomiclabs/hardhat-anvil",
        `Anvil network config is invalid: ${e.message}`,
        e
      );
    }

    // Test for unsupported commands
    if (options.accounts !== undefined) {
      throw new NomicLabsHardhatPluginError(
        "@nomiclabs/hardhat-anvil",
        "Config: anvil.accounts unsupported for this network"
      );
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

  public stopServer() {
    this._server.kill();
  }

  private _snakeCase(str: string) {
    return str.replace(/([A-Z]){1}/g, (match) => `_${match.toLowerCase()}`);
  }
}
