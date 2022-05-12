const assert = require("assert");

describe("Tests using the anvil plugin", function () {
  it("Anvil must be accessible", async function () {
    const accounts = await network.provider.send("eth_accounts");
    assert(accounts.length !== 0, "No account was returned");
  });

  it("can send transaction", async function () {
    const wallets = waffle.provider.getWallets();
    console.log(wallets);
    const accounts = await network.provider.send("eth_accounts");
    console.log(accounts);
    const EVMConsumer = await artifacts.readArtifact("EVMConsumer");
    const tx = await network.provider.send("eth_sendTransaction", [
      {
        from: accounts[0],
        data: EVMConsumer.bytecode,
      },
    ]);
  });
});
