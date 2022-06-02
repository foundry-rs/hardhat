import { assert } from "chai";
import path from "path";
import { useEnvironment, getAllFiles } from "./helpers";

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

    it("Should write artifacts to disk", async function () {
      const artifacts = await this.hre.artifacts.getArtifactPaths();
      const files = await getAllFiles(this.hre.config.paths.artifacts);
      assert.equal(artifacts.length, files.length);

      for (const file of files) {
        const name = path.basename(file);
        assert(artifacts.map((a) => path.basename(a)).includes(name));
        const artifact = require(file);
        assert.equal(artifact.contractName, path.basename(name, ".json"));
      }
    });

    it("Should return build info", async function () {
      const info = await this.hre.artifacts.getBuildInfo("Contract");
      assert.exists(info);
      const contract = info?.output.contracts["src/Contract.sol"].Contract!;
      assert.exists(contract);
      assert.exists(contract.abi);
      assert.exists((contract as any).devdoc);
      assert.exists((contract as any).metadata);
      assert.exists((contract as any).storageLayout);
      assert.exists((contract as any).userdoc);
      assert.exists(contract.evm);
      assert.exists(contract.evm.bytecode);
      assert.exists(contract.evm.bytecode.object);
      assert.exists(contract.evm.deployedBytecode);
      assert.exists(contract.evm.deployedBytecode.object);
    });
  });
});
