// tslint:disable-next-line no-implicit-dependencies
// eslint-disable-next-line import/no-extraneous-dependencies

import { assert } from "chai";
import { AnvilService } from "@foundry-rs/hardhat-anvil/dist/src/anvil-service";
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
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("no-anvil-config");

    it("Should expose anvil defaults configs in hardhat's config", function () {
      assert.isDefined(this.hre.config.networks.anvil);
      const defaultOptions = AnvilService.getDefaultOptions() as any;
      const options = this.hre.config.networks.anvil as any;

      // Iterate over all default options and assert equality
      for (const [key, value] of Object.entries(defaultOptions)) {
        assert.equal(options[key], value);
      }
    });

    it.only("Should add run anvil node", async function () {
      void this.hre.run("node");
      // ensure we don't wait forever
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });
  });
});
