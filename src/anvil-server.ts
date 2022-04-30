import { spawn } from "child_process";
import debug from "debug";
const log = debug("hardhat:plugin:anvil-service::spawn");

export class AnvilServer {
  private readonly _anvil: any;
  private readonly _options: any;

  private constructor(options: any, anvil: any) {
    this._options = options;
    this._anvil = anvil;
  }

  public static launch(options: any): AnvilServer {
    log("Launching anvil");
    const anvilPath = options.path ?? "anvil";
    // TODO transform options to args
    const anvil = spawn(anvilPath);

    anvil.stdout.on("data", (data) => {
      console.log(`${data}`);
    });

    anvil.stderr.on("data", (data) => {
      console.error(`${data}`);
    });

    anvil.on("close", (code) => {
      log(`anvil child process exited with code ${code}`);
    });

    return new AnvilServer(options, anvil);
  }

  public kill() {
    this._anvil.kill();
  }
}
