require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 
 module.exports = {
  networks: {
    localhost: {
      //Requires start of local network at port:
      url: "http://127.0.0.1:8545"
    },
    hardhat: {},
    polygon: {
      url: "https://polygon-rpc.com/",
      //Consider any address posted here to be compromised
      //accounts: [""]
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/3929f51780ec46d6903b10b02207c53b",
      //Consider any address posted here to be compromised
      //accounts: ["26f79db75776e49903be1f2f5d44b0ce3167b865b3cfc02c6e7ee3973ce8dc64","26cf0e71eeb12471b708d6cc9f27a864594b73338da439c2e6acf7571eaeeaa7"]
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      }
    ],
  },
  mocha: {
    timeout: 10000000000
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice"
  },
  etherscan: {
    apiKey: ""
  }
};
