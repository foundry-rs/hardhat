[![npm](https://img.shields.io/npm/v/@nomiclabs/hardhat-anvil.svg)](https://www.npmjs.com/package/@nomiclabs/hardhat-anvil) [![hardhat](https://hardhat.org/buidler-plugin-badge.svg?1)](https://hardhat.org)

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
require("@nomiclabs/hardhat-anvil");
```

Or, if you are using TypeScript, add this to your `hardhat.config.ts`:

```js
import "@nomiclabs/hardhat-anvil";
```

## Tasks

This plugin hooks into the `test` and `run` tasks to wrap them in the instantiation and termination of a `anvil-core` instance. This plugin creates no additional tasks.

## Environment extensions

This plugin doesn't extend the Hardhat Runtime Environment.

## Usage

There are no additional steps you need to take for this plugin to work.

## Configuration

You can set any of the [Anvil's options](https://github.com/trufflesuite/anvil-core#options) through the `anvil` network config. All of them are supported, with the exception of `accounts`.

This example sets a larger block gas limit and the default balance of Anvil's accounts.

```js
module.exports = {
  defaultNetwork: "anvil",
  networks: {
    anvil: {
      gasLimit: 6000000000,
      defaultBalanceEther: 10,
    },
  },
};
```

Note: The `accounts` option is not currently supported.
