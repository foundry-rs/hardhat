import "../../../src/index";

export default {
  defaultNetwork: "anvil",
  networks: {
    anvil: {
      url: "http://127.0.0.1:8545/",
      launch: true
    },
  },
  solidity: "0.8.10",
};
