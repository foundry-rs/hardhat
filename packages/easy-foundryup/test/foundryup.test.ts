import * as foundryup from "../src";

describe("Foundryup command tests", function () {
  const installed = false;

  before(async function () {
    try {
      this.installed = await foundryup.run(true);
    } catch (e) {
      this.installed = false;
    }
  });

  it("Should get commands if installed", async function () {
    if (this.installed) {
      const _anvil = await foundryup.getAnvilCommand();
      const _forge = await foundryup.getCastCommand();
      const _cast = await foundryup.getForgeCommand();
    }
  });
});
