// tslint:disable-next-line no-implicit-dependencies
// eslint-disable-next-line import/no-extraneous-dependencies

import { useEnvironment } from "./helpers";

describe("Integration tests", function () {
  this.timeout(300000);
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    it("Should build", async function () {
      await this.hre.run("compile", {});
    });

    it("Should add run anvil node", async function () {
      void this.hre.run("node");
      // ensure we don't wait forever
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });
  });
});
