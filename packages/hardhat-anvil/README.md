# hardhat-anvil

This Hardhat plugin automatically starts and stops [Anvil](https://github.com/foundry-rs/foundry/tree/master/anvil) when running tests or scripts.

## What

This plugin creates a network named `anvil`. When this network is used, it can either connect to a running `anvil` instance or launch a new server automatically before running tests and scripts.

## Installation

### Anvil binary

See [anvil installation](https://github.com/foundry-rs/foundry/tree/master/anvil#installation)

### Plugin

```bash
npm install --save-dev @foundry-rs/hardhat-anvil
```

And add the following statement to your `hardhat.config.js`:

```js
require("@foundry-rs/hardhat-anvil");
```

Or, if you are using TypeScript, add this to your `hardhat.config.ts`:

```js
import "@foundry-rs/hardhat-anvil";
```

## Tasks

This plugin hooks into the `test`.

## Environment extensions

This plugin adds a `waffle` object to the Hardhat Runtime Environment. This object has all the Waffle functionality, already adapted to work with Hardhat.

This is a slightly modified, `anvil` compatible version of [`@nomiclabs/hardhat-waffle`](https://github.com/NomicFoundation/hardhat/tree/master/packages/hardhat-waffle).

## Usage

Once `anvil` is installed you can simply run it and configure it via the CLI.

Once installed, you can build your tests almost like in Waffle.

Instead of importing things from `ethereum-waffle`, you access them from the `waffle` property of the Hardhat Runtime Environment.

## Configuration

You can set any of the [Anvil's options](https://github.com/foundry-rs/foundry/tree/master/anvil) (or `anvil --help`) through the `anvil` network config.

**Note: currently only default settings are used if `launch: true`. All other configs are currently ignored**

It's recommend to spawn `anvil` manually in a separate shell, see also [Foundry repo](https://github.com/foundry-rs/foundry/tree/master/anvil)

This example sets a larger block gas limit and the default balance of Anvil's accounts.

```js
module.exports = {
  defaultNetwork: "anvil",
    anvil: {
      url: "http://127.0.0.1:8545/",
      launch: false, // if set to `true`, it will spawn a new instance if the plugin is initialized, if set to `false` it expects an already running anvil instance
    }
  }
};
```

By default, the `anvil` object will be configured as

```js
{
  hdPath: "m/44'/60'/0'/0/",
  mnemonic: 'test test test test test test test test test test test junk',
  url: 'http://127.0.0.1:8545/',
  launch: true,
  accounts: {
    mnemonic: 'test test test test test test test test test test test junk',
    path: "m/44'/60'/0'/0/"
  }
}
```

## LICENSE

- MIT license ([LICENSE](LICENSE) or https://opensource.org/licenses/MIT)
