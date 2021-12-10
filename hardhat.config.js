require("@nomiclabs/hardhat-waffle");
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
      url: "https://ropsten.infura.io/v3/",
      //Consider any address posted here to be compromised
      //accounts: ["",""]
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.1",
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
    timeout: 1000000000
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice"
  }
};
