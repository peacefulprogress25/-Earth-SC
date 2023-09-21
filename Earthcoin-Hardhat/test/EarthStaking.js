const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EarthStaking contract", function () {
  let owner;
  let user;
  let EARTH;
  let FRUIT;
  let stakingContract;
  const epochSizeSeconds = 86400; // Example epoch size in seconds (1 day)
  const startTimestamp = Math.floor(Date.now() / 1000) - 3600; // Example start timestamp (1 hour ago)

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy the EarthERC20Token contract
    const EarthERC20TokenFactory = await ethers.getContractFactory("EarthERC20Token");
    EARTH = await EarthERC20TokenFactory.deploy();
    await EARTH.deployed();
    await EARTH.connect(owner).addMinter(user.address);

    // Deploy the Fruit contract
    const FruitFactory = await ethers.getContractFactory("Fruit");
    FRUIT = await FruitFactory.deploy();
    await FRUIT.deployed();

    // Deploy the EarthStaking contract
    const EarthStakingFactory = await ethers.getContractFactory("EarthStaking");
    stakingContract = await EarthStakingFactory.deploy(EARTH.address, epochSizeSeconds, startTimestamp);
    await stakingContract.deployed();
  });

  it("Should allow staking", async function () {
    // Approve FRUIT allowance for the user
    const initialFruitAllowance = ethers.utils.parseUnits("1000", 18);
    // Approve EARTH tokens
    const stakeAmountEarth = ethers.utils.parseUnits("1000", 18);
    await EARTH.connect(user).approve(stakingContract.address, stakeAmountEarth);
    await FRUIT.connect(user).approve(stakingContract.address, initialFruitAllowance);

    const initialUserBalanceEarth = await EARTH.balanceOf(user.address);
    await EARTH.connect(user).mint(user.address, stakeAmountEarth);

    const initialUserBalanceFruit = await FRUIT.balanceOf(user.address);

    const fruitminted = await stakingContract.connect(user).stake(stakeAmountEarth);

    const finalUserBalanceEarth = await EARTH.balanceOf(user.address);
    const finalUserBalanceFruit = await FRUIT.balanceOf(user.address);

    expect(finalUserBalanceEarth).to.equal(initialUserBalanceEarth);
    expect(finalUserBalanceFruit).to.equal(fruitminted.value);
  });

  it("Should not allow staking 0 tokens", async function () {
    // await expect(stakingContract.connect(user).stake(0)).to.be.revertedWith("Cannot stake 0 tokens");
    await expect(stakingContract.connect(user).stake(0)).to.be.reverted;
  });

  it("Should allow the owner to set EPY", async function () {
    const numerator = 2;
    const denominator = 4;

    await stakingContract.connect(owner).setEpy(numerator, denominator);

    const epy = await stakingContract.getEpy(10000);
    expect(epy).to.equal((numerator / denominator) * 10000);
  });

  // Add more test cases for other functions and scenarios as needed
});
