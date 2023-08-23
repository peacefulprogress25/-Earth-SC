const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const StableCoin = await hre.ethers.getContractFactory("StableCoin");
  const stableCoin = await StableCoin.deploy();
  await stableCoin.deployed();

  const StableCoinData = {
    address: stableCoin.address,
    abi: JSON.parse(stableCoin.interface.format("json")),
  };
  fs.writeFileSync(
    "frontend-admin/src/abi/StableCoin.json",
    JSON.stringify(StableCoinData)
  );

  console.log("Stable Coin deployed to:", stableCoin.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
