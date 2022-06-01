// forge specific artifacts handler

import fsExtra from "fs-extra";
import * as os from "os";
import * as path from "path";

import {
  Artifact,
  Artifacts as IArtifacts,
  BuildInfo,
  CompilerInput,
  CompilerOutput,
} from "hardhat/types";
import {
  findDistance,
  getFullyQualifiedName,
  isFullyQualifiedName,
  parseFullyQualifiedName,
} from "hardhat/utils/contract-names";
import { replaceBackslashes } from "hardhat/utils/source-names";
import { glob, globSync } from "hardhat/internal/util/glob";
import { HardhatError } from "hardhat/internal/core/errors";
import { ERRORS } from "hardhat/internal/core/errors-list";
import {
  ARTIFACT_FORMAT_VERSION,
  EDIT_DISTANCE_THRESHOLD,
} from "hardhat/internal/constants";
import { ForgeArtifact } from "./types";

export class ForgeArtifacts implements IArtifacts {
  constructor(
    private _root: string,
    private _out: string,
    private _cache: string
  ) {}

  public async readArtifact(name: string): Promise<Artifact> {
    const artifactPath = await this._getArtifactPath(name);
    const forgeArtifact = (await fsExtra.readJson(
      artifactPath
    )) as ForgeArtifact;
    return this.convertForgeArtifact(forgeArtifact, artifactPath, name);
  }

  public readArtifactSync(name: string): Artifact {
    const artifactPath = this._getArtifactPathSync(name);
    const forgeArtifact = fsExtra.readJsonSync(artifactPath) as ForgeArtifact;
    return this.convertForgeArtifact(forgeArtifact, artifactPath, name);
  }

  /**
   * Noop so that runSuper can be called
   */
  public addValidArtifacts(
    _validArtifacts: Array<{ sourceName: string; artifacts: string[] }>
  ) {}

  /**
   * Noop so that runSuper can be called
   */
  public async removeObsoleteArtifacts() {}

  /**
   * Converts a forge artifact to a hardhat style `Artifact`
   * @param artifact
   * @param artifactPath
   * @param name
   */
  public convertForgeArtifact(
    artifact: ForgeArtifact,
    artifactPath: string,
    name: string
  ): Artifact {
    const { abi, bytecode, deployedBytecode } = artifact;
    const hhArtifact = {
      _format: ARTIFACT_FORMAT_VERSION,
      contractName: name,
      sourceName: this._getFullyQualifiedNameFromPath(artifactPath),
      abi,
      bytecode: bytecode.object,
      deployedBytecode: deployedBytecode.object,
      linkReferences: deployedBytecode.linkReferences,
      deployedLinkReferences: bytecode.linkReferences,
    };
    return hhArtifact as Artifact;
  }

  public async artifactExists(name: string): Promise<boolean> {
    try {
      await this.readArtifact(name);
      return true;
    } catch {
      return false;
    }
  }

  public async getAllFullyQualifiedNames(): Promise<string[]> {
    const paths = await this.getArtifactPaths();
    return paths.map((p) => this._getFullyQualifiedNameFromPath(p)).sort();
  }

  public async getBuildInfo(
    _fullyQualifiedName: string
  ): Promise<BuildInfo | undefined> {
    return undefined;
  }

  public async getArtifactPaths(): Promise<string[]> {
    const paths = await glob(path.join(this._out, "**/*.json"));
    return paths.sort();
  }

  public async getBuildInfoPaths(): Promise<string[]> {
    return [];
  }

  public async getDebugFilePaths(): Promise<string[]> {
    return [];
  }

  public async saveArtifactAndDebugFile(
    _artifact: Artifact,
    _pathToBuildInfo?: string
  ) {}

  public async saveBuildInfo(
    _solcVersion: string,
    _solcLongVersion: string,
    _input: CompilerInput,
    _output: CompilerOutput
  ): Promise<string> {
    return "";
  }

  /**
   * Returns the absolute path to the artifact that corresponds to the given
   * name.
   *
   * If the name is fully qualified, the path is computed from it.  If not, an
   * artifact that matches the given name is searched in the existing artifacts.
   * If there is an ambiguity, an error is thrown.
   */
  private async _getArtifactPath(name: string): Promise<string> {
    if (isFullyQualifiedName(name)) {
      return this._getValidArtifactPathFromFullyQualifiedName(name);
    }

    const files = await this.getArtifactPaths();
    return this._getArtifactPathFromFiles(name, files);
  }

  private _getArtifactPathsSync(): string[] {
    const paths = globSync(path.join(this._out, "**/*.json"));
    return paths.sort();
  }

  /**
   * Sync version of _getArtifactPath
   */
  private _getArtifactPathSync(name: string): string {
    if (isFullyQualifiedName(name)) {
      return this._getValidArtifactPathFromFullyQualifiedNameSync(name);
    }

    const files = this._getArtifactPathsSync();
    return this._getArtifactPathFromFiles(name, files);
  }

  /**
   * Same signature as imported function, but abstracted to handle the only error we consistently care about
   */
  private async _trueCasePath(
    filePath: string,
    basePath?: string
  ): Promise<string | null> {
    const { trueCasePath } = await import("true-case-path");

    try {
      const result = await trueCasePath(filePath, basePath);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no matching file exists")) {
          return null;
        }
      }

      // eslint-disable-next-line @nomiclabs/hardhat-internal-rules/only-hardhat-error
      throw error;
    }
  }

  /**
   * Same signature as imported function, but abstracted to handle the only error we consistently care about
   * and synchronous
   */
  private _trueCasePathSync(
    filePath: string,
    basePath?: string
  ): string | null {
    const { trueCasePathSync } = require("true-case-path");

    try {
      const result = trueCasePathSync(filePath, basePath);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no matching file exists")) {
          return null;
        }
      }

      // eslint-disable-next-line @nomiclabs/hardhat-internal-rules/only-hardhat-error
      throw error;
    }
  }

  /**
   * Returns the absolute path to the given artifact
   */
  public formArtifactPathFromFullyQualifiedName(
    fullyQualifiedName: string
  ): string {
    const { sourceName, contractName } =
      parseFullyQualifiedName(fullyQualifiedName);
    return path.join(this._out, sourceName, `${contractName}.json`);
  }

  private async _getValidArtifactPathFromFullyQualifiedName(
    fullyQualifiedName: string
  ): Promise<string> {
    const artifactPath =
      this.formArtifactPathFromFullyQualifiedName(fullyQualifiedName);

    const trueCaseArtifactPath = await this._trueCasePath(
      path.relative(this._out, artifactPath),
      this._out
    );

    if (trueCaseArtifactPath === null) {
      return this._handleWrongArtifactForFullyQualifiedName(fullyQualifiedName);
    }

    if (artifactPath !== trueCaseArtifactPath) {
      throw new HardhatError(ERRORS.ARTIFACTS.WRONG_CASING, {
        correct: trueCaseArtifactPath,
        incorrect: artifactPath,
      });
    }

    return artifactPath;
  }

  /**
   * DO NOT DELETE OR CHANGE
   *
   * use this.formArtifactPathFromFullyQualifiedName instead
   * @deprecated until typechain migrates to public version
   * @see https://github.com/dethcrypto/TypeChain/issues/544
   */
  private _getArtifactPathFromFullyQualifiedName(
    fullyQualifiedName: string
  ): string {
    return this.formArtifactPathFromFullyQualifiedName(fullyQualifiedName);
  }

  private _getAllContractNamesFromFiles(files: string[]): string[] {
    return files.map((file) => {
      const fqn = this._getFullyQualifiedNameFromPath(file);
      return parseFullyQualifiedName(fqn).contractName;
    });
  }

  private _getAllFullyQualifiedNamesSync(): string[] {
    const paths = this._getArtifactPathsSync();
    return paths.map((p) => this._getFullyQualifiedNameFromPath(p)).sort();
  }

  private _formatSuggestions(names: string[], contractName: string): string {
    switch (names.length) {
      case 0:
        return "";
      case 1:
        return `Did you mean "${names[0]}"?`;
      default:
        return `We found some that were similar:

${names.map((n) => `  * ${n}`).join(os.EOL)}

Please replace "${contractName}" for the correct contract name wherever you are trying to read its artifact.
`;
    }
  }

  private _handleWrongArtifactForFullyQualifiedName(
    fullyQualifiedName: string
  ): never {
    const names = this._getAllFullyQualifiedNamesSync();

    const similarNames = this._getSimilarContractNames(
      fullyQualifiedName,
      names
    );

    throw new HardhatError(ERRORS.ARTIFACTS.NOT_FOUND, {
      contractName: fullyQualifiedName,
      suggestion: this._formatSuggestions(similarNames, fullyQualifiedName),
    });
  }

  private _handleWrongArtifactForContractName(
    contractName: string,
    files: string[]
  ): never {
    const names = this._getAllContractNamesFromFiles(files);

    let similarNames = this._getSimilarContractNames(contractName, names);

    if (similarNames.length > 1) {
      similarNames = this._filterDuplicatesAsFullyQualifiedNames(
        files,
        similarNames
      );
    }

    throw new HardhatError(ERRORS.ARTIFACTS.NOT_FOUND, {
      contractName,
      suggestion: this._formatSuggestions(similarNames, contractName),
    });
  }

  /**
   * If the project has these contracts:
   *   - 'contracts/Greeter.sol:Greeter'
   *   - 'contracts/Meeter.sol:Greeter'
   *   - 'contracts/Greater.sol:Greater'
   *  And the user tries to get an artifact with the name 'Greeter', then
   *  the suggestions will be 'Greeter', 'Greeter', and 'Greater'.
   *
   * We don't want to show duplicates here, so we use FQNs for those. The
   * suggestions will then be:
   *   - 'contracts/Greeter.sol:Greeter'
   *   - 'contracts/Meeter.sol:Greeter'
   *   - 'Greater'
   */
  private _filterDuplicatesAsFullyQualifiedNames(
    files: string[],
    similarNames: string[]
  ): string[] {
    const outputNames = [];
    const groups = similarNames.reduce((obj, cur) => {
      obj[cur] = obj[cur] ? obj[cur] + 1 : 1;
      return obj;
    }, {} as { [k: string]: number });

    for (const [name, occurrences] of Object.entries(groups)) {
      if (occurrences > 1) {
        for (const file of files) {
          if (path.basename(file) === `${name}.json`) {
            outputNames.push(this._getFullyQualifiedNameFromPath(file));
          }
        }
        continue;
      }

      outputNames.push(name);
    }

    return outputNames;
  }

  /**
   *
   * @param givenName can be FQN or contract name
   * @param names MUST match type of givenName (i.e. array of FQN's if givenName is FQN)
   * @returns
   */
  private _getSimilarContractNames(
    givenName: string,
    names: string[]
  ): string[] {
    let shortestDistance = EDIT_DISTANCE_THRESHOLD;
    let mostSimilarNames: string[] = [];
    for (const name of names) {
      const distance = findDistance(givenName, name);

      if (distance < shortestDistance) {
        shortestDistance = distance;
        mostSimilarNames = [name];
        continue;
      }

      if (distance === shortestDistance) {
        mostSimilarNames.push(name);
        continue;
      }
    }

    return mostSimilarNames;
  }

  private _getValidArtifactPathFromFullyQualifiedNameSync(
    fullyQualifiedName: string
  ): string {
    const artifactPath =
      this.formArtifactPathFromFullyQualifiedName(fullyQualifiedName);

    const trueCaseArtifactPath = this._trueCasePathSync(
      path.relative(this._out, artifactPath),
      this._out
    );

    if (trueCaseArtifactPath === null) {
      return this._handleWrongArtifactForFullyQualifiedName(fullyQualifiedName);
    }

    if (artifactPath !== trueCaseArtifactPath) {
      throw new HardhatError(ERRORS.ARTIFACTS.WRONG_CASING, {
        correct: trueCaseArtifactPath,
        incorrect: artifactPath,
      });
    }

    return artifactPath;
  }

  private _getDebugFilePath(artifactPath: string): string {
    return artifactPath.replace(/\.json$/, ".dbg.json");
  }

  private _getArtifactPathFromFiles(
    contractName: string,
    files: string[]
  ): string {
    const matchingFiles = files.filter((file) => {
      return path.basename(file) === `${contractName}.json`;
    });

    if (matchingFiles.length === 0) {
      return this._handleWrongArtifactForContractName(contractName, files);
    }

    if (matchingFiles.length > 1) {
      const candidates = matchingFiles.map((file) =>
        this._getFullyQualifiedNameFromPath(file)
      );

      throw new HardhatError(ERRORS.ARTIFACTS.MULTIPLE_FOUND, {
        contractName,
        candidates: candidates.join(os.EOL),
      });
    }

    return matchingFiles[0];
  }

  /**
   * Returns the FQN of a contract giving the absolute path to its artifact.
   *
   * For example, given a path like
   * `/path/to/project/artifacts/contracts/Foo.sol/Bar.json`, it'll return the
   * FQN `contracts/Foo.sol:Bar`
   */
  private _getFullyQualifiedNameFromPath(absolutePath: string): string {
    const sourceName = replaceBackslashes(
      path.relative(this._out, path.dirname(absolutePath))
    );

    const contractName = path.basename(absolutePath).replace(".json", "");

    return getFullyQualifiedName(sourceName, contractName);
  }

  /**
   * Remove the artifact file, its debug file and, if it exists, its build
   * info file.
   */
  private async _removeArtifactFiles(artifactPath: string) {
    await fsExtra.remove(artifactPath);

    const debugFilePath = this._getDebugFilePath(artifactPath);
    const buildInfoPath = await this._getBuildInfoFromDebugFile(debugFilePath);

    await fsExtra.remove(debugFilePath);

    if (buildInfoPath !== undefined) {
      await fsExtra.remove(buildInfoPath);
    }
  }

  /**
   * Given the path to a debug file, returns the absolute path to its
   * corresponding build info file if it exists, or undefined otherwise.
   */
  private async _getBuildInfoFromDebugFile(
    debugFilePath: string
  ): Promise<string | undefined> {
    if (await fsExtra.pathExists(debugFilePath)) {
      const { buildInfo } = await fsExtra.readJson(debugFilePath);
      return path.resolve(path.dirname(debugFilePath), buildInfo);
    }

    return undefined;
  }

  /**
   * Given the path to a directory, hardhat style artifacts will
   * be written to disk
   */
  public writeArtifactsSync(outDir: string) {
    const paths = this._getArtifactPathsSync();
    const artifacts = path.relative(this._root, outDir);

    for (const filepath of paths) {
      const forgeArtifact = fsExtra.readJsonSync(filepath) as ForgeArtifact;
      const artifact = this.readArtifactSync(path.parse(filepath).name);

      const contractPath = forgeArtifact.ast?.absolutePath;
      if (!contractPath) {
        throw new Error(
          `Must compile with ast to build harhat style artifacts`
        );
      }

      const dir = path.join(this._root, artifacts, contractPath);
      const out = path.join(dir, path.basename(filepath));
      fsExtra.mkdirpSync(path.dirname(out));
      fsExtra.writeJsonSync(out, artifact, { spaces: 2 });
    }
  }
}

/**
 * Retrieves an artifact for the given `contractName` from the compilation output.
 *
 * @param sourceName The contract's source name.
 * @param contractName the contract's name.
 * @param contractOutput the contract's compilation output as emitted by `solc`.
 */
export function getArtifactFromContractOutput(
  sourceName: string,
  contractName: string,
  contractOutput: any
): Artifact {
  const evmBytecode = contractOutput.evm && contractOutput.evm.bytecode;
  let bytecode: string =
    evmBytecode && evmBytecode.object ? evmBytecode.object : "";

  if (bytecode.slice(0, 2).toLowerCase() !== "0x") {
    bytecode = `0x${bytecode}`;
  }

  const evmDeployedBytecode =
    contractOutput.evm && contractOutput.evm.deployedBytecode;
  let deployedBytecode: string =
    evmDeployedBytecode && evmDeployedBytecode.object
      ? evmDeployedBytecode.object
      : "";

  if (deployedBytecode.slice(0, 2).toLowerCase() !== "0x") {
    deployedBytecode = `0x${deployedBytecode}`;
  }

  const linkReferences =
    evmBytecode && evmBytecode.linkReferences ? evmBytecode.linkReferences : {};
  const deployedLinkReferences =
    evmDeployedBytecode && evmDeployedBytecode.linkReferences
      ? evmDeployedBytecode.linkReferences
      : {};

  return {
    _format: ARTIFACT_FORMAT_VERSION,
    contractName,
    sourceName,
    abi: contractOutput.abi,
    bytecode,
    deployedBytecode,
    linkReferences,
    deployedLinkReferences,
  };
}
