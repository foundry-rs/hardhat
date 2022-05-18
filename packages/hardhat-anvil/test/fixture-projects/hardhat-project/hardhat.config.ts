import "../../../src/index";

export default {
  solidity: "0.8.10",
  defaultNetwork: "anvil",
  networks: {
    anvil: {
      url: "http://127.0.0.1:8545/",
      launch: true
    },
  },
};
