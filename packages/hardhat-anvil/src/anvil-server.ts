import { spawn } from "child_process";
import debug from "debug";
import { getAnvilCommand } from "@foundry-rs/easy-foundryup";
import { AnvilOptions } from "./anvil-service";

const log = debug("hardhat::plugin::anvil::spawn");

export class AnvilServer {
  private readonly _anvil: any;
  private readonly _options: AnvilOptions;

  private constructor(options: AnvilOptions, anvil: any) {
    this._options = options;
    this._anvil = anvil;
  }

  public static async launch(
    options: any,
    inherit: boolean = false
  ): Promise<AnvilServer> {
    log("Launching anvil");
    let anvil: any;
    if (options.launch) {
      const anvilPath = options.path ?? (await getAnvilCommand());
      const args = [];
      if (options.port) {
        args.push("--port", options.port);
      }
      if (options.totalAccounts) {
        args.push("--accounts", options.totalAccounts);
      }
      if (options.mnemonic) {
        args.push("--mnemonic", options.mnemonic);
      }
      if (options.defaultBalanceEther) {
        args.push("--balance", options.defaultBalanceEther);
      }
      if (options.hdPath) {
        args.push("--derivation-path", options.hdPath);
      }
      if (options.silent) {
        args.push("--silent", options.silent);
      }
      if (options.blockTime) {
        args.push("--block-time", options.blockTime);
      }
      if (options.gasLimit) {
        args.push("--gas-limit", options.gasLimit);
      }
      if (options.gasPrice) {
        if (options.gasPrice !== "auto") {
          args.push("--gas-price", options.gasPrice);
        }
      }
      if (options.chainId) {
        args.push("--chain-id", options.chainId);
      }
      if (options.forkUrl) {
        args.push("--fork-url", options.forkUrl);
        if (options.forkBlockNumber) {
          args.push("--fork-block-number", options.forkBlockNumber);
        }
      }
      if (options.noStorageCaching) {
        args.push("--no-storage-caching");
      }
      if (options.hardfork) {
        if (options.hardfork !== "arrowGlacier") {
          args.push("--hardfork", options.hardfork);
        }
      }

      const opts = inherit ? { stdio: "inherit" } : {};

      anvil = spawn(anvilPath, args, opts as any);

      anvil.on("close", (code: any) => {
        log(`anvil child process exited with code ${code}`);
      });

      process.on("exit", function () {
        anvil.kill();
      });

      if (!inherit) {
        let serverReady = false;
        anvil.stdout.on("data", (data: any) => {
          const output = data.toString();
          if (output.includes("Listening")) {
            serverReady = true;
          }
          log(`${data}`);
        });

        anvil.stderr.on("data", (data: any) => {
          log(`${data}`);
        });

        // wait until server ready
        const retries = 30; // 3secs
        for (let i = 0; i < retries; i++) {
          if (serverReady) {
            log("anvil server ready");
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    }

    return new AnvilServer(options, anvil);
  }

  public kill() {
    this._anvil?.kill();
  }

  public async waitUntilClosed(): Promise<void> {
    return new Promise((resolve) => {
      this._anvil.once("close", resolve);
    });
  }
}
