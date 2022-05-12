import { exec, spawn } from "child_process";

const FOUNDRYUP_INSTALLER = 'curl -sSL "https://foundry.paradigm.xyz" | sh';

/**
 * Installs foundryup via subprocess
 */
export async function selfInstall(): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn("/bin/sh", ["-c", FOUNDRYUP_INSTALLER], {
      stdio: "inherit",
    });
    process.on("exit", (code) => {
      resolve(code === 0);
    });
  });
}

/**
 * Optional target location `foundryup` accepts
 */
export interface FoundryupTarget {
  branch?: string;
  commit?: string;
  repo?: string;
  path?: string;
}

/**
 * Executes `foundryup`
 *
 * @param install whether to install `foundryup` itself
 * @param _target additional `foundryup` params
 */
export async function run(
  install: boolean = true,
  _target: FoundryupTarget = {}
): Promise<boolean> {
  if (install) {
    if (!(await checkFoundryUp())) {
      if (!(await selfInstall())) {
        return false;
      }
    }
  }
  return checkCommand("foundryup");
}

/**
 * Checks if foundryup exists
 *
 * @return true if `foundryup` exists
 */
export async function checkFoundryUp(): Promise<boolean> {
  return checkCommand("foundryup --version");
}

/**
 * Checks if anvil exists
 *
 * @return true if `anvil` exists
 */
export async function checkAnvil(): Promise<boolean> {
  return checkCommand("anvil --version");
}

/**
 * Checks if cast exists
 *
 * @return true if `cast` exists
 */
export async function checkCast(): Promise<boolean> {
  return checkCommand("cast --version");
}

/**
 * Checks if cast exists
 *
 * @return true if `cast` exists
 */
export async function checkForge(): Promise<boolean> {
  return checkCommand("forge --version");
}

/**
 * Executes the given command
 *
 * @param cmd the command to run
 * @return returns true if the command succeeded, false otherwise
 */
async function checkCommand(cmd: string): Promise<boolean> {
  return new Promise((resolve) => {
    const process = exec(cmd);
    process.on("exit", (code) => {
      if (code !== 0) {
        console.error(
          "Command failed. Is Foundry not installed? Consider installing via `curl -L https://foundry.paradigm.xyz | bash` and then running `foundryup` on a new terminal. For more context, check the installation instructions in the book: https://book.getfoundry.sh/getting-started/installation.html."
        );
      }
      resolve(code === 0);
    });
  });
}
