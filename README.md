[![npm](https://img.shields.io/npm/v/@foundry/hardhat-anvil.svg)](https://www.npmjs.com/package/@foundry/hardhat-anvil) [![hardhat](https://hardhat.org/buidler-plugin-badge.svg?1)](https://hardhat.org)

**WIP**

# hardhat-anvil

This Hardhat plugin automatically starts and stops [Anvil](https://github.com/foundry-rs/foundry/anvil) when running tests or scripts.

## What

This plugin creates a network named `anvil`. When this network is used, a Anvil server will be automatically started before running tests and scripts, and stopped when finished.

## Installation

```bash
npm install --save-dev @foundry/hardhat-anvil
```

And add the following statement to your `hardhat.config.js`:

```js
require("@foundry/hardhat-anvil");
```

Or, if you are using TypeScript, add this to your `hardhat.config.ts`:

```js
import "@foundry/hardhat-anvil";
```

## Tasks

This plugin hooks into the `test` and `run` tasks to wrap them in the instantiation and termination of a `anvil-core` instance. This plugin creates no additional tasks.

## Environment extensions

This plugin adds a `waffle` object to the Hardhat Runtime Environment. This object has all the Waffle functionality, already adapted to work with Hardhat.

This is a modified, `anvil` compatible version of [`@nomiclabs/hardhat-waffle`](https://github.com/NomicFoundation/hardhat/tree/master/packages/hardhat-waffle).

## Usage

Once `anvil` is installed you can simply run it and configure it via the CLI.

Once installed, you can build your tests almost like in Waffle.

Instead of importing things from `ethereum-waffle`, you access them from the `waffle` property of the Hardhat Runtime Environment.

## Configuration

You can set any of the [Anvil's options](https://github.com/foundry-rs/foundry/anvil) through the `anvil` network config. All of them are supported, with the exception of `accounts`.

This example sets a larger block gas limit and the default balance of Anvil's accounts.

```js
module.exports = {
  defaultNetwork: "anvil",
    anvil: {
      url: "http://127.0.0.1:8545/",
      launch: true, // if set to false, this will assume anvil is already running
    },
  },
};
```

Note: currently only default settings are used if `launch: false`. All other configs are currently ignored

## LICENSE

* MIT license ([LICENSE](LICENSE) or
  https://opensource.org/licenses/MIT)
