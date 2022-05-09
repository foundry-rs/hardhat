import { task } from "hardhat/config";
import { ForgeBuildArgs, spawnBuild } from "./forge";

task("build")
  .setDescription("Compiles the entire project with forge")
  .addFlag("force", "Clear the cache and artifacts folder and recompile.")
  .addFlag(
    "offline",
    "Do not access the network. Missing solc versions will not be installed."
  )
  .addFlag(
    "viaIR",
    "Use the Yul intermediate representation compilation pipeline."
  )
  .setAction(async (args: ForgeBuildArgs, {}) => {
    await spawnBuild(args);
  });
