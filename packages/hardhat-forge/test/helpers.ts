import { resetHardhatContext } from "hardhat/plugins-testing";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fsExtra from "fs-extra";

import path from "path";

declare module "mocha" {
  interface Context {
    hre: HardhatRuntimeEnvironment;
  }
}

export function useEnvironment(fixtureProjectName: string) {
  beforeEach("Loading hardhat environment", function () {
    process.chdir(path.join(__dirname, "fixture-projects", fixtureProjectName));

    this.hre = require("hardhat");
  });

  afterEach("Resetting hardhat", function () {
    resetHardhatContext();
  });
}

export async function getAllFiles(directory: string, files: string[] = []) {
  const current = await fsExtra.readdir(directory);
  for (const file of current) {
    const next = path.join(directory, file);
    const info = await fsExtra.stat(next);
    if (info.isDirectory()) {
      files = await getAllFiles(next, files);
    } else {
      files.push(next);
    }
  }
  return files;
}
