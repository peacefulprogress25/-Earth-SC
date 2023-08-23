const { users, contractAddress } = require("./setAllocatorsParameters.json");

const main = async () => {
  const PresalAllocation = await ethers.getContractFactory("PresaleAllocation");
  const contract = await PresalAllocation.attach(contractAddress);

  for (let i = 0; i < users.length; i++) {
    const staker = users[i][0];
    const amount = users[i][1];
    const epoch = users[i][2];
    await contract.setAllocation(staker, amount, epoch);
  }
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
