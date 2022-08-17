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

    it("Should populare hre.config.foundry", async function () {
      assert.exists(this.hre.config.foundry);
      assert.typeOf(this.hre.config.foundry, "object");
      assert.equal(this.hre.config.foundry?.viaIr, true);
    });

    it("Should read artifacts", async function () {
      const artifacts = await this.hre.artifacts.getArtifactPaths();
      assert.isNotEmpty(artifacts);
      const contract = await this.hre.artifacts.readArtifact(
        "Contract.sol:Contract"
      );
      assert.equal(contract.sourceName, "src/Contract.sol");
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
      // filter out the debug files and metadata
      const filtered = files
        .filter((f) => !f.includes(".dbg.json"))
        .filter((f) => !f.includes(".metadata.json"));
      assert.equal(artifacts.length, filtered.length);

      for (const file of filtered) {
        const name = path.basename(file);
        assert(artifacts.map((a) => path.basename(a)).includes(name));
        const artifact = require(file);
        assert.equal(artifact.contractName, path.basename(name, ".json"));
      }
    });

    it("Should write debug files to disk", async function () {
      const debugFilePaths = await this.hre.artifacts.getDebugFilePaths();
      const artifactPaths = await this.hre.artifacts.getArtifactPaths();
      assert.equal(debugFilePaths.length, artifactPaths.length);

      for (const debugFile of debugFilePaths) {
        const debug = require(debugFile);
        assert.equal(debug._format, "hh-sol-dbg-1");
        assert.exists(debug.buildInfo);
      }
    });

    it("Should return build info", async function () {
      const info = await this.hre.artifacts.getBuildInfo(
        "Contract.sol:Contract"
      );
      assert.exists(info);
      const contract = info?.output.contracts["src/Contract.sol"].Contract!;
      assert.exists(contract);
      assert.exists(contract.abi);
      assert.exists((contract as any).devdoc);
      assert.exists((contract as any).metadata);
      assert.typeOf((contract as any).metadata, "object");
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
