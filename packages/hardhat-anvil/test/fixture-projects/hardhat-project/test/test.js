const assert = require("assert");

describe("Tests using the anvil plugin", function () {
  it("Anvil must be accessible", async function () {
    const accounts = await network.provider.send("eth_accounts");
    assert(accounts.length !== 0, "No account was returned");
  });

  it("can send transaction", async function () {
    const accounts = waffle.provider.getWallets();
    const EVMConsumer = await artifacts.readArtifact("EVMConsumer");
    const tx = await network.provider.send("eth_sendTransaction", [
      {
        from: accounts[0],
        data: EVMConsumer.bytecode,
      },
    ]);
  });

  it("can send transaction with env provider", async function () {
    const accounts = await network.provider.send("eth_accounts");
    const EVMConsumer = await artifacts.readArtifact("EVMConsumer");
    const tx = await network.provider.send("eth_sendTransaction", [
      {
        from: accounts[0],
        data: EVMConsumer.bytecode,
      },
    ]);
  });
});
