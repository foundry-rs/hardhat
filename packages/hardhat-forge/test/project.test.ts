import { assert } from "chai";
import { useEnvironment } from "./helpers";

describe("Integration tests", function () {
  this.timeout(300000);
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    it("Should build", async function () {
      await this.hre.run("compile");
    });

    it("Should test", async function () {
      await this.hre.run("test");
    });

    it("Should return config", async function () {
      const config = await this.hre.run("forge:config");
      assert.equal(config.src, "src");
      assert.equal(config.out, "out");
    });
  });
});
