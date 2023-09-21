const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EarthTreasury contract", function () {
  let owner;
  let user;
  let STABLEC;
  let EARTH;
  let MINT_ALLOWANCE;
  let treasury;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

   // Deploy mock contracts (you should replace these with actual contract deployments)
    const STABLECFactory = await ethers.getContractFactory("StableCoin");
    STABLEC = await STABLECFactory.deploy();

    const EarthERC20TokenFactory = await ethers.getContractFactory("EarthERC20Token");
    EARTH = await EarthERC20TokenFactory.deploy();
    await EARTH.deployed();

    await EARTH.grantRole(await EARTH.CAN_MINT(), owner.address);

    // Deploy MintAllowance contract
    const MintAllowanceFactory = await ethers.getContractFactory("MintAllowance");
    MINT_ALLOWANCE = await MintAllowanceFactory.deploy(EARTH.address);

    // Deploy the EarthTreasury contract
    const EarthTreasuryFactory = await ethers.getContractFactory("EarthTreasury");
    treasury = await EarthTreasuryFactory.deploy(EARTH.address, STABLEC.address);

    await treasury.deployed();

    await STABLEC.connect(owner).approve(treasury.address, 1000);
    await EARTH.connect(owner).approve(treasury.address, 5000);

    // Seed the treasury with STABLEC and EARTH (you can modify this as needed)
    await treasury.connect(owner).seedMint(1000, 5000);
  });

  it("Should have the correct initial state", async function () {

    // Check if the treasury is seeded
    const isSeeded = await treasury.seeded();
    expect(isSeeded).to.equal(true);

    // Check the intrinsic value ratio
    const ratio = await treasury.intrinsicValueRatio();
    expect(ratio.stablec).to.equal(1000);
    expect(ratio.earth).to.equal(5000);

    // Add more checks for the initial state as needed
  });

  it("Should allow the owner to harvest rewards", async function () {
    // Harvest rewards with a distribution percentage
    await treasury.harvest(10);

    // Check if the harvested rewards were added to the treasury
    const harvestedRewardsEarth = await treasury.harvestedRewardsEarth();
    expect(harvestedRewardsEarth).to.be.above(0);
  });

  it("Should not allow non-owner to harvest rewards", async function () {
  // Attempt to harvest rewards with a distribution percentage as a non-owner
  await expect(treasury.connect(user).harvest(10)).to.be.revertedWith("Ownable: caller is not the owner");
});

it("Should allow the owner to reset intrinsic value", async function () {
  await treasury.harvest(10);
  await treasury.resetIV();

  // Check if the intrinsic value has been reset to the correct values
  const ratio = await treasury.intrinsicValueRatio();
  expect(ratio.stablec).to.equal(1000); 
  expect(ratio.earth).to.equal(5000); 
});

it("Should not allow non-owner to reset intrinsic value", async function () {
  // Attempt to reset intrinsic value as a non-owner
  await expect(treasury.connect(user).resetIV()).to.be.revertedWith("Ownable: caller is not the owner");
});

it("Should allow the owner to mint and allocate Earth to a contract", async function () {
  const contractAddress = "0xYourContractAddress"; // Replace with an actual contract address
  await treasury.mintAndAllocateEarth(contractAddress, 1000);

  const earthBalance = await EARTH.balanceOf(contractAddress);
  expect(earthBalance).to.equal(1000); // Change this value to the expected Earth balance of the contract
});

it("Should not allow non-owner to mint and allocate Earth to a contract", async function () {
  // Attempt to mint and allocate Earth as a non-owner
  const contractAddress = "0xYourContractAddress"; // Replace with an actual contract address
  await expect(treasury.connect(user).mintAndAllocateEarth(contractAddress, 1000)).to.be.revertedWith("Ownable: caller is not the owner");
});

it("Should allow the owner to unallocate and burn unused minted Earth from a contract", async function () {
  const contractAddress = "0xYourContractAddress"; // Replace with an actual contract address
  await treasury.mintAndAllocateEarth(contractAddress, 1000);

  await treasury.unallocateAndBurnUnusedMintedEarth(contractAddress);

  // Check if the Earth has been burned correctly
  const earthBalance = await EARTH.balanceOf(contractAddress);
  expect(earthBalance).to.equal(0);
});

it("Should not allow non-owner to unallocate and burn unused minted Earth", async function () {
  const contractAddress = "0xYourContractAddress"; // Replace with an actual contract address
  await treasury.mintAndAllocateEarth(contractAddress, 1000);

  // Attempt to unallocate and burn unused minted Earth as a non-owner
  await expect(treasury.connect(user).unallocateAndBurnUnusedMintedEarth(contractAddress)).to.be.revertedWith("Ownable: caller is not the owner");
});

it("Should allow the owner to allocate STABLEC to a contract", async function () {
  // Allocate STABLEC to a contract
  const contractAddress = "0xYourContractAddress"; // Replace with an actual contract address
  await treasury.allocateTreasuryStablec(contractAddress, 1000);

  const stablecBalance = await STABLEC.balanceOf(contractAddress);
  expect(stablecBalance).to.equal(1000); // Change this value to the expected STABLEC balance of the contract
});

it("Should allow the owner to update mark to market for a contract", async function () {
  // Allocate STABLEC to a contract
  const contractAddress = "0xYourContractAddress"; // Replace with an actual contract address
  await treasury.allocateTreasuryStablec(contractAddress, 1000);

  // Update mark to market for the contract
  await treasury.updateMarkToMarket(contractAddress);
});

it("Should not allow non-owner to update mark to market for a contract", async function () {
  // Allocate STABLEC to a contract
  const contractAddress = "0xYourContractAddress"; // Replace with an actual contract address
  await treasury.allocateTreasuryStablec(contractAddress, 1000);

  // Attempt to update mark to market for the contract as a non-owner
  await expect(treasury.connect(user).updateMarkToMarket(contractAddress)).to.be.revertedWith("Ownable: caller is not the owner");
});

});
