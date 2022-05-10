// tslint:disable-next-line no-implicit-dependencies
// eslint-disable-next-line import/no-extraneous-dependencies

import { useEnvironment } from "./helpers";

describe("Integration tests", function () {
  this.timeout(300000);
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    it("Should build", async function () {
      await this.hre.run("compile");
    });
  });
});
