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

    it("Should read artifacts", async function () {
      const artifacts = await this.hre.artifacts.getArtifactPaths();
      assert.isNotEmpty(artifacts);
      const contract = await this.hre.artifacts.readArtifact("Contract");
      assert.exists(contract.abi);
      assert.exists(contract.bytecode);
      assert.typeOf(contract.bytecode, "string");
      assert.exists(contract.deployedBytecode);
      assert.typeOf(contract.deployedBytecode, "string");
      assert.exists(contract.linkReferences);
      assert.exists(contract.deployedLinkReferences);
      assert.exists(contract.contractName);
      assert.exists(contract.sourceName);
    });
  });
});
