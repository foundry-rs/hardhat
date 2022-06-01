---

This repo contains [hardhat](https://github.com/NomicFoundation/hardhat) plugins to use [foundry](https://github.com/foundry-rs/foundry/) tools in hardhat environments.

## Installation

See in each plugin

- [anvil](./packages/hardhat-anvil/README.md)
- [forge](./packages/hardhat-forge/README.md)
- [foundryup](./packages/easy-foundryup/README.md)

## Documentation

- [Foundry repo](https://github.com/foundry-rs/foundry/)
- [Foundry book](https://book.getfoundry.sh/)
- [Anvil](https://github.com/foundry-rs/foundry/tree/master/anvil)

## Releases

### The develop branch

_Adapted from Optimism's [release process](https://github.com/ethereum-optimism/optimism#overview)_

Our primary development branch is [`develop`](https://github.com/foundry-rs/hardhat/tree/develop/).

Developers can release new versions of the software by adding changesets to their pull requests using `yarn changeset`. Changesets will persist over time on the `develop` branch without triggering new version bumps to be proposed by the Changesets bot. Once changesets are merged into `master`, the bot will create a new pull request called "Version Packages" which bumps the versions of packages. The correct flow for triggering releases is to update the base branch of these pull requests onto `develop` and merge them, and then create a new pull request to merge `develop` into `master`. Then, the `release` workflow will trigger the actual publishing to `npm` and Docker hub.

Be sure to not merge other pull requests into `develop` if partially through the release process. This can cause problems with Changesets doing releases and will require manual intervention to fix it.

## Contributing

See [contributing guidelines](https://github.com/foundry-rs/foundry/blob/master/CONTRIBUTING.md)
