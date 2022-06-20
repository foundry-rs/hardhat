import { BuildInfo } from "hardhat/types";

/**
 * Represents an artifact emitted by forge
 */
export declare interface ForgeArtifact {
  abi: any[];
  bytecode: Bytecode;
  deployedBytecode: Bytecode;
  ast?: any;
  assembly?: any;
  methodIdentifiers?: any;
  generatedSources?: any;
  functionDebugData?: any;
  gasEstimates?: any;
  metadata?: any;
  storageLayout?: any;
  userdoc?: any;
  devdoc?: any;
  ir?: any;
  irOptimized?: any;
  ewasm?: any;
}

export declare interface Bytecode {
  object?: string;
  sourceMap?: string;
  linkReferences?: any;
}

export interface ForgeCache {
  _format: string;
  paths: Paths;
  files: Map<string, FileEntry>;
}

export interface Paths {
  artifacts: string;
  sources: string;
  tests: string;
  libraries: string[];
}

export interface FileEntry {
  lastModificationDate: number;
  contentHash: string;
  sourceName: string;
  imports: any[];
  versionRequirement: string;
  artifacts: Map<string, string>;
}

// Represents a BuildInfo and the path
// to its file on the filesystem
export interface BuildInfoArtifact {
  buildInfo: BuildInfo;
  buildInfoPath: string;
}
