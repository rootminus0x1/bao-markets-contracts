
const { ethers } = require("hardhat");

async function main() { 
    console.log(ethers.utils.getContractAddress({ from:"0xB52E098eE9F15FC8C76962250Bc7f1d7956285A3" , nonce:82 }));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });