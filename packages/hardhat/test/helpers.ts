import { resetHardhatContext } from "hardhat/plugins-testing";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import net from "net";

declare module "mocha" {
  interface Context {
    hre: HardhatRuntimeEnvironment;
  }
}

export function useEnvironment(fixtureProjectName: string) {
  beforeEach("Loading hardhat environment", async function () {
    process.chdir(path.join(__dirname, "fixture-projects", fixtureProjectName));

    this.hre = require("hardhat");
    this.freePort = await getPortFree();
  });

  afterEach("Resetting hardhat", function () {
    resetHardhatContext();
  });
}

async function getPortFree() {
  return new Promise((res) => {
    const srv = net.createServer() as any;
    srv.listen(0, () => {
      const port = srv.address().port;
      srv.close((_err: any) => res(port));
    });
  });
}
