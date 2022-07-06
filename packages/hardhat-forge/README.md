# hardhat-forge

This Hardhat plugin is for [forge](https://github.com/foundry-rs/foundry/tree/master/forge).

## What

This plugin provides bindings for `forge` commands as hardhat tasks. It can
generate hardhat style artifacts that can be used with hardhat tooling such as
[hardhat-deploy](https://github.com/wighawag/hardhat-deploy) or hardhat tasks.

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

## Configuration

See [Foundry](https://github.com/foundry-rs/foundry).

The `HardhatUserConfig` is extended with a `foundry` object that can be used
to configure the plugin as well as `forge`.

```js
const config: HardhatUserConfig = {
  foundry: {
    buildInfo: true,
  },
}
```

## LICENSE

- MIT license ([LICENSE](LICENSE) or https://opensource.org/licenses/MIT)
