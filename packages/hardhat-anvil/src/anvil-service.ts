import debug from "debug";
import { NomicLabsHardhatPluginError } from "hardhat/internal/core/errors";
import { URL } from "url";
import { AnvilServer } from "./anvil-server";

const log = debug("hardhat:plugin:anvil-service");

export declare interface AnvilOptions {
  url: string;
  accountKeysPath?: string; // Translates to: account_keys_path
  accounts?: object[] | object;
  hostname?: string;
  allowUnlimitedContractSize?: boolean;
  blockTime?: number;
  launch?: boolean; // whether to launch the server at all
  defaultBalanceEther?: number; // Translates to: default_balance_ether
  forkUrl?: string | object;
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

  public static getDefaultAccountConfig(): AnvilOptions {
    return {
      locked: false,
      hdPath: "m/44'/60'/0'/0/",
      mnemonic: "test test test test test test test test test test test junk",
      ...AnvilService.getDefaultOptions(),
    };
  }

  public static getDefaultOptions(): AnvilOptions {
    return {
      url: `http://127.0.0.1:${DEFAULT_PORT}/`,
      launch: true,
    };
  }

  /**
   *
   * @param options
   * @returns type checked options for `anvil`
   */
  public static async getCheckedArgs(options: any): Promise<AnvilOptions> {
    // Get and initialize option validator
    const { default: optionsSchema } = await import("./anvil-options-ti");
    const { createCheckers } = await import("ts-interface-checker");
    const { AnvilOptionsTi } = createCheckers(optionsSchema);

    // Validate all options against the validator
    try {
      AnvilOptionsTi.check(options);
    } catch (e) {
      const err = e as any;
      throw new NomicLabsHardhatPluginError(
        "@foundry-rs/hardhat-anvil",
        `Anvil network config is invalid: ${err.message}`,
        err
      );
    }

    // Validate and parse hostname and port from URL (this validation is priority)
    const url = new URL(options.url);
    if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      throw new NomicLabsHardhatPluginError(
        "@foundry-rs/hardhat-anvil",
        "Anvil network only works with localhost"
      );
    }

    return options as AnvilOptions;
  }

  public static async create(
    options: any,
    inherit: boolean = false
  ): Promise<AnvilService> {
    const args = await AnvilService.getCheckedArgs(options);
    const Anvil = await AnvilServer.launch(args, inherit);

    return new AnvilService(Anvil, args);
  }

  private readonly _server: any;
  private readonly _options: any;

  private constructor(Anvil: any, options: any) {
    log("Initializing server");
    this._server = Anvil;
    this._options = options;
  }

  public stopServer() {
    this._server.kill();
  }

  public async waitUntilClosed(): Promise<void> {
    return this._server.waitUntilClosed();
  }
}
