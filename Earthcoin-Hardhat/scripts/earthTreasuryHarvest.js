const {
  harvestPercentage,
  contractAddress,
} = require("./harvestParameters.json");

const main = async () => {
  // Contract initialization
  const EarthTreasury = await ethers.getContractFactory("EarthTreasury");
  const contract = await EarthTreasury.attach(contractAddress);

  try {
    await contract.harvest(harvestPercentage);
  } catch (error) {
    console.log("Error: ", error);
  }
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
