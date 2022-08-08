const hre = require("hardhat");
// const { CRYTPO_DEV_TOKEN_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  const cryptoDevTokenAddress = "0x6D737a57081CEb0d4e4d2F32055F02eBa5cFe623";
  console.log(cryptoDevTokenAddress);

  const exchangeContract = await hre.ethers.getContractFactory("Exchange");

  const deployedExchangeContract = await exchangeContract.deploy(
    cryptoDevTokenAddress
  );
  await deployedExchangeContract.deployed();

  // print the address of the deployed contract
  console.log("Exchange Contract Address: ", deployedExchangeContract.address);

}

// call the main function and catch if there is an error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });