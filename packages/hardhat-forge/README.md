# hardhat-forge

This Hardhat plugin is for [forge](https://github.com/foundry-rs/foundry/tree/master/forge).

## What

This plugin enables projects to use both foundry and hardhat. It provides
bindings for `forge` commands as hardhat tasks. It generates hardhat style
artifacts that can be used with hardhat tooling such as
[hardhat-deploy](https://github.com/wighawag/hardhat-deploy) or hardhat tasks.

It is useful for projects that already have hardhat tooling and want to take
advantage of features only found in foundry such as writing tests in solidity
or fuzzing. It also allows for projects to write tests in solidity and do
chainops in TypeScript or JavaScript.

## Installation

```bash
npm install --save-dev @foundry-rs/hardhat-forge
```

And add the following statement to your `hardhat.config.js`:

```js
require("@foundry-rs/hardhat-forge");
```

Or, if you are using TypeScript, add this to your `hardhat.config.ts`:

```js
import "@foundry-rs/hardhat-forge";
```

## Tasks

This plugin provides the following tasks:

- `forge:config` returns the forge config
- `compile` overwrites the standard hardhat compile and uses the foundry
  toolchain instead

## Usage

The following hardhat task could be used to interact with a contract named
`Contract` that is compiled with the foundry compiler toolchain.

```js
import { task } from "hardhat/config"
import assert from "assert"

task("example").setAction(async (args, hre) => {
  const contract = await this.hre.artifacts.readArtifact("Contract");
  console.log(contract.abi)

  const info = await this.hre.artifacts.getBuildInfo("Contract");
  assert(typeof info === "object")
})
```

## Configuration

See [Foundry](https://github.com/foundry-rs/foundry).

The `HardhatUserConfig` is extended with a `foundry` object that can be used
to configure the plugin as well as `forge`. Configuration that is passed in via
the `HardhatUserConfig` will overwrite values that are configured in the
`foundry.toml`.

Note that `forge` must be configured to generate hardhat style build info files
for this plugin to function correctly.

```js
const config: HardhatUserConfig = {
  foundry: {
    buildInfo: true,
  },
}
```

## LICENSE

- MIT license ([LICENSE](LICENSE) or https://opensource.org/licenses/MIT)
