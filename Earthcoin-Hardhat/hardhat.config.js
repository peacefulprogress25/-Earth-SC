require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-web3");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    matictestnet: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.MATICTEST_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 8000000000,
    },
    maticmainnet: {
      url: "https://rpc-mainnet.maticvigil.com/",
      accounts: [process.env.MATICMAIN_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 8000000000,
    },
  },
};
