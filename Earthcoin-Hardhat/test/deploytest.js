const { expect } = require("chai");
// const hre = require("hardhat");
const fs = require("fs");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
// const { ethers } = require("ethers");
const {
    exitQueue: { epochSize, maxPerAddress, maxPerEpoch },
    earthStaking: { epochSizeSeconds, startTimestamp },
    presale: { mintMultiple, unlockTimestamp },
    stableCoin: stableCoinAddress,
} = require("../scripts/deployParameters.json");


describe("deploy contract", function () {

    async function deploycontracts() {

        // 1. EarthERC20Token Deployment
        const EarthERC20Token = await ethers.getContractFactory(
            "EarthERC20Token"
        );
        const [owner, addr1, addr2] = await ethers.getSigners();
        const earthERC20Token = await EarthERC20Token.deploy();
        await earthERC20Token.deployed();
        console.log(earthERC20Token.address);




        //stable coin 
        const StableCoin = await ethers.getContractFactory("StableCoin");
        const stableCoin = await StableCoin.deploy();
        await stableCoin.deployed();
        const stableCoinAddress = stableCoin.address;


        // 2. ExitQueue Deployment
        const ExitQueue = await ethers.getContractFactory("ExitQueue");
        const exitQueue = await ExitQueue.deploy(
            earthERC20Token.address,
            maxPerEpoch,
            maxPerAddress,
            epochSize
        );
        await exitQueue.deployed();

        const exitQueueData = {
            address: exitQueue.address,
            abi: JSON.parse(exitQueue.interface.format("json")),
        };


        console.log(exitQueue.address);

        // 3. EarthStaking Deployment
        const EarthStaking = await ethers.getContractFactory("EarthStaking");
        const earthStaking = await EarthStaking.deploy(
            earthERC20Token.address,
            exitQueue.address,
            epochSizeSeconds,
            startTimestamp
        );
        await earthStaking.deployed();

        const earthStakingData = {
            address: earthStaking.address,
            abi: JSON.parse(earthStaking.interface.format("json")),
        };


        console.log(earthStaking.address);

        // 4. Fruit Deployment
        const fruit = await earthStaking.FRUIT();
        console.log(fruit);
        const FruitData = {
            address: fruit,
            abi: JSON.parse(
                fs.readFileSync("artifacts/contracts/Fruit.sol/Fruit.json").toString()
            ).abi,
        };


        // 5. LockedFruit Deployment
        const LockedFruit = await ethers.getContractFactory("LockedFruit");
        const lockedFruit = await LockedFruit.deploy(fruit);
        await lockedFruit.deployed();

        const LockedFruitData = {
            address: lockedFruit.address,
            abi: JSON.parse(lockedFruit.interface.format("json")),
        };


        console.log(lockedFruit.address);

        // // 6. StableCoin Deployment
        // const StableCoinPreviousData = fs.readFileSync(
        //     "frontend-admin/src/abi/StableCoin.json"
        // );
        // const StableCoinData = {
        //     address: stableCoinAddress,
        //     abi: JSON.parse(StableCoinPreviousData.toString()).abi,
        // };

        // console.log(stableCoinAddress);


        // 7. EarthTreasury Deployment
        const EarthTreasury = await ethers.getContractFactory("EarthTreasury");
        const earthTreasury = await EarthTreasury.deploy(
            earthERC20Token.address,
            stableCoinAddress
        );
        await earthTreasury.deployed();

        const EarthTreasuryData = {
            address: earthTreasury.address,
            abi: JSON.parse(earthTreasury.interface.format("json")),
        };

        console.log(earthTreasury.address);

        // 8. MintAllowance Deployment
        console.log(await earthTreasury.MINT_ALLOWANCE());

        // 9. PresaleAllocation Deployment
        const PresaleAllocation = await ethers.getContractFactory(
            "PresaleAllocation"
        );
        const presaleAllocation = await PresaleAllocation.deploy();
        await presaleAllocation.deployed();

        const PresaleAllocationData = {
            address: presaleAllocation.address,
            abi: JSON.parse(presaleAllocation.interface.format("json")),
        };


        console.log(presaleAllocation.address);

        // 10. Presale Deployment
        const PRESALE = await ethers.getContractFactory("Presale");
        const preSALE = await PRESALE.deploy(
            stableCoinAddress,
            earthERC20Token.address,
            earthStaking.address,
            lockedFruit.address,
            earthTreasury.address,
            presaleAllocation.address,
            mintMultiple,
            unlockTimestamp
        );
        await preSALE.deployed();

        const presaleData = {
            address: preSALE.address,
            abi: JSON.parse(preSALE.interface.format("json")),
        };


        console.log(preSALE.address);





        return { earthERC20Token, earthStaking, earthTreasury, lockedFruit, fruit, FruitData, exitQueue, earthStakingData, stableCoin, presaleAllocation, owner, addr1, addr2, preSALE };
    }



    it("minting and transfering tokens to other account", async function () {
        const { earthERC20Token, owner, addr1 } = await loadFixture(deploycontracts);
        // const [owner, addr1, addr2] = await ethers.getSigners();
        await earthERC20Token.addMinter(owner.address);
        await earthERC20Token.mint(owner.address, 100);
        await earthERC20Token.transfer(addr1.address, 100);

        // console.log(earthERC20Token.balanceOf(addr1.address));
        expect(await earthERC20Token.balanceOf(addr1.address)).to.equal(100);
    });


    it(" minting and staking tokens ", async function () {
        const { earthERC20Token, earthStaking, owner, addr1 } = await loadFixture(deploycontracts);
        // const [owner, addr1, addr2] = await ethers.getSigners();
        await earthERC20Token.addMinter(owner.address);
        await earthERC20Token.mint(owner.address, 100);
        await earthERC20Token.addMinter(earthStaking.address);
        await earthERC20Token.increaseAllowance(earthStaking.address, 100);
        await earthStaking.stake(50);

        // console.log(earthERC20Token.balanceOf(addr1.address));
        expect(await earthERC20Token.balanceOf(earthStaking.address)).to.equal(50);
    });

    it(" minting and staking and unstake", async function () {
        const { earthERC20Token, earthStaking, exitQueue, FruitData, owner, fruit } = await loadFixture(deploycontracts);
        // const [owner, addr1, addr2] = await ethers.getSigners();
        await earthERC20Token.addMinter(owner.address);
        await earthERC20Token.mint(owner.address, 100);
        // await fruit.mint(owner.address, 100);
        // await fruit.approve(earthStaking.address, 100);
        const contract = new ethers.Contract(
            FruitData.address,
            FruitData.abi,
            owner
        );


        await earthERC20Token.addMinter(earthStaking.address);
        await earthERC20Token.addMinter(exitQueue.address);
        await earthERC20Token.increaseAllowance(earthStaking.address, 100);
        await earthStaking.stake(50);
        await contract.approve(earthStaking.address, 50);

        await earthStaking.unstake(30);
        // await exitQueue.withdraw(0);


        // console.log(earthERC20Token.balanceOf(addr1.address));
        expect(await earthERC20Token.balanceOf(earthStaking.address)).to.equal(21);
    });


    it(" single page scripts ", async function () {
        const { earthERC20Token, lockedFruit, earthTreasury, earthStaking, exitQueue, FruitData, owner, fruit, preSALE, stableCoin, presaleAllocation } = await loadFixture(deploycontracts);

        const seedMint = {
            increaseAllowanceAddress: earthTreasury.address,
            amount: "1",
            addMinterAddress: earthTreasury.address,
            amountStablec: "1",
            amountTemple: "1",
        };

        // mintStake
        const mintStake = {
            addMinterAddress: preSALE.address,
            increaseAllowanceAddress: preSALE.address,
            increaseAllowanceAmount: "1",
            presaleAllocationAddress: owner.address,
            presaleAllocationAmount: "1",
            presaleAllocationEpoch: "0",
            mintStakeAmount: "1",
            walletAddress: owner.address,
            stakingAddress: earthStaking.address,
            increasedAmount: "1",
        };

        // Locked Fruit
        let LockedFruitData = {
            walletAddress: owner.address,
            amount: "1",
            numLocks: "", // check again
        };

        const unStake = {
            amount: "1",
        };

        const withdrawEpoch = {
            nextUnallocatedEpoch: "0",
        };
        const fruitc = new ethers.Contract(
            FruitData.address,
            FruitData.abi,
            owner
        );


        await stableCoin.increaseAllowance(
            seedMint.increaseAllowanceAddress,
            ethers.BigNumber.from(`${seedMint.amount}000000000000000000`)
        );
        console.log(await fruitc.balanceOf(owner.address));
        // await stableCoin.increaseAllowance(
        //     owner.address,
        //     ethers.BigNumber.from(`${seedMint.amount}000000000000000000`)
        // );

        await earthERC20Token.addMinter(seedMint.addMinterAddress);
        await earthERC20Token.addMinter(preSALE.address);
        await earthERC20Token.addMinter(owner.address);

        // await earthERC20Token.addMinter(earthStaking.address);  //
        // await earthERC20Token.addMinter(exitQueue.address); //


        await earthTreasury.seedMint(ethers.BigNumber.from(`${seedMint.amountStablec}000000000000000000`), ethers.BigNumber.from(`${seedMint.amountTemple}000000000000000000`));

        await stableCoin.increaseAllowance(mintStake.increaseAllowanceAddress, ethers.BigNumber.from(`${mintStake.increaseAllowanceAmount}000000000000000000`));

        await presaleAllocation.setAllocation(
            mintStake.presaleAllocationAddress,
            ethers.BigNumber.from(`${mintStake.presaleAllocationAmount}000000000000000000`),
            mintStake.presaleAllocationEpoch);


        await preSALE.mintAndStake(ethers.BigNumber.from(`${mintStake.mintStakeAmount}000`));                 //lower amount

        LockedFruitData.numLocks = await lockedFruit.numLocks(LockedFruitData.walletAddress);

        await lockedFruit.withdraw(0);

        //   await fruitc.allowance(wallet,staking);

        await fruitc.increaseAllowance(mintStake.stakingAddress,
            ethers.BigNumber.from(`${mintStake.increasedAmount}000000000000000000`));

        await fruitc.approve(earthStaking.address, ethers.BigNumber.from(`${mintStake.increasedAmount}000000000000000000`));


        // await earthStaking.unstake(ethers.BigNumber.from(`${unStake.amount}000`));
        console.log(await fruitc.balanceOf(owner.address));

        await exitQueue.nextUnallocatedEpoch();
        console.log(await fruitc.balanceOf(owner.address));

        // console.log(earthERC20Token.balanceOf(addr1.address));
        // expect(await earthERC20Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from("1000000000000000000"));
        expect(await fruitc.balanceOf(owner.address)).to.equal(999);

    });


    it(" preallocation to x account ", async function () {

        const { earthERC20Token, lockedFruit, earthTreasury, earthStaking, exitQueue, FruitData, fruit, preSALE, stableCoin, presaleAllocation } = await loadFixture(deploycontracts);
        const [owner, addr1] = await ethers.getSigners();


        await earthERC20Token.addMinter(earthTreasury.address);
        await earthERC20Token.addMinter(preSALE.address);
        await earthERC20Token.addMinter(owner.address);
        await stableCoin.increaseAllowance(
            earthTreasury.address,
            ethers.BigNumber.from("1000000000000000000")
        );
        await earthTreasury.seedMint(ethers.BigNumber.from("10000000000000000"), ethers.BigNumber.from("1000000000000000"));


        await stableCoin.increaseAllowance(preSALE.address, ethers.BigNumber.from("10000000000000000"));
        await stableCoin.increaseAllowance(presaleAllocation.address, ethers.BigNumber.from("10000000000000000"));
        // await stableCoin.increaseAllowance(, 1000000000);

        // await presaleAllocation.setAllocation(
        //     owner.address,
        //     1000,
        //     0);


        await presaleAllocation.setAllocation(
            addr1.address,
            ethers.BigNumber.from("1000"),
            0);



        // await preSALE.connect(addr1).mintAndStake(1);


        // await helpers.time.increase(86400);
        // await helpers.time.increase(86400);
        // await helpers.time.increase(86400);
        // await helpers.time.increase(86400);
        // await helpers.time.increase(86400);
        // await helpers.time.increase(86400);
        // await lockedFruit.connect(addr1).withdraw(0);
        let li = await (presaleAllocation.allocationOf(addr1.address));

        expect(li[0]).to.equal(1000);

    });



    it(" single page scripts exit ", async function () {
        const { earthERC20Token, lockedFruit, earthTreasury, earthStaking, exitQueue, FruitData, fruit, preSALE, stableCoin, presaleAllocation } = await loadFixture(deploycontracts);
        const [owner, addr1] = await ethers.getSigners();

        const seedMint = {
            increaseAllowanceAddress: earthTreasury.address,
            amount: "1",
            addMinterAddress: earthTreasury.address,
            amountStablec: "1",
            amountTemple: "1",
        };

        // mintStake
        const mintStake = {
            addMinterAddress: preSALE.address,
            increaseAllowanceAddress: preSALE.address,
            increaseAllowanceAmount: "1",
            presaleAllocationAddress: owner.address,
            presaleAllocationAmount: "1",
            presaleAllocationEpoch: "0",
            mintStakeAmount: "1",
            walletAddress: owner.address,
            stakingAddress: earthStaking.address,
            increasedAmount: "1",
        };

        // Locked Fruit
        let LockedFruitData = {
            walletAddress: owner.address,
            amount: "1",
            numLocks: "", // check again
        };

        const unStake = {
            amount: "1",
        };

        const withdrawEpoch = {
            nextUnallocatedEpoch: "0",
        };
        const fruitc = new ethers.Contract(
            FruitData.address,
            FruitData.abi,
            owner
        );

        console.log(await fruitc.balanceOf(addr1.address));

        await stableCoin.increaseAllowance(
            seedMint.increaseAllowanceAddress,
            ethers.BigNumber.from(`${seedMint.amount}000000000000000000`)
        );
        // console.log(await fruitc.balanceOf(owner.address));
        // await stableCoin.increaseAllowance(
        //     owner.address,
        //     ethers.BigNumber.from(`${seedMint.amount}000000000000000000`)
        // );

        await earthERC20Token.addMinter(seedMint.addMinterAddress);
        await earthERC20Token.addMinter(preSALE.address);
        await earthERC20Token.addMinter(owner.address);

        // await earthERC20Token.addMinter(earthStaking.address);  //
        // await earthERC20Token.addMinter(exitQueue.address); //


        await earthTreasury.seedMint(ethers.BigNumber.from(`${seedMint.amountStablec}000000000000000000`), ethers.BigNumber.from(`${seedMint.amountTemple}000000000000000000`));

        await stableCoin.increaseAllowance(mintStake.increaseAllowanceAddress, ethers.BigNumber.from(`${mintStake.increaseAllowanceAmount}000000000000000000`));

        await presaleAllocation.setAllocation(
            addr1.address,
            ethers.BigNumber.from(`${mintStake.presaleAllocationAmount}000000000000000000`),
            mintStake.presaleAllocationEpoch);
        await stableCoin.increaseAllowance(addr1.address, ethers.BigNumber.from(`${mintStake.increaseAllowanceAmount}000000000000000000`));

        await stableCoin.mint(ethers.BigNumber.from(`${mintStake.increaseAllowanceAmount}00000000000000`), addr1.address);

        await stableCoin.connect(addr1).approve(preSALE.address, ethers.BigNumber.from(`${mintStake.increaseAllowanceAmount}00000000000000`));


        await preSALE.connect(addr1).mintAndStake(ethers.BigNumber.from(`${mintStake.mintStakeAmount}000`));                 //lower 


        // await helpers.time.increase(86400);
        // await helpers.time.increase(86400);
        // await helpers.time.increase(86400);
        // await ethers.provider.send('evm_increaseTime', [86400]);
        // await ethers.provider.send('evm_mine');

        // await ethers.provider.send('evm_increaseTime', [86400]);
        // await ethers.provider.send('evm_mine');
        console.log("lockedfruit number");
        console.log(await lockedFruit.numLocks(addr1.address));
        await lockedFruit.connect(addr1).withdraw(0);           //o 1 

        await fruitc.connect(addr1).approve(
            earthStaking.address,
            `${mintStake.increaseAllowanceAmount}00`
        );

        await fruitc.connect(addr1).approve(
            exitQueue.address,
            `${mintStake.increaseAllowanceAmount}00`
        );
        await earthERC20Token.connect(addr1).approve(
            exitQueue.address,
            `${mintStake.increaseAllowanceAmount}00`
        );

        await earthStaking.connect(addr1).unstake((ethers.BigNumber.from(`${mintStake.mintStakeAmount}0`)));
        // console.log("this");
        // console.log(await exitQueue.nextUnallocatedEpoch());
        // await exitQueue.connect(addr1).withdraw(0);
        await exitQueue.connect(addr1).withdraw(0);
        // console.log(await earthERC20Token.balanceOf(addr1.address));
        expect(await earthERC20Token.balanceOf(addr1.address)).to.equal(10);

    });




});