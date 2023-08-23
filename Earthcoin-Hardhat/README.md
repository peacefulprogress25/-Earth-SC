## Main Project

`Note: - Temple Staking start timestamp can't be more than 2 days in the past - Resource for epoch timestamp: https://www.epochconverter.com/`

### Deploying:

Default values

- Exit queue

  - 0x5FbDB2315678afecb367f032d93F642f64180aa3
  - 1000
  - 1000
  - 10

- Temple Staking

  - 86400
  - 1637411155

- Presale

  - 6
  - 1636647316

- Simple Token
  - 0x59ca9345516cbc127e592A8d3551C58f8b0E83e9

### Seed Mint Script

- Simple Token Increase allowance
  - `let simpleTokenC = await simpleToken.increaseAllowance( "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707", //TempleTreasury ethers.BigNumber.from("10000000000000000000") //10 );`
- AddMinter to templeTreasury by templeERC20Token
  - `await templeERC20Token.addMinter( "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707" // Temple treasury );`
- Seed Mint from temple treasury
  - `const seedMint = await templeTreasury.seedMint( ethers.BigNumber.from("1000000000000000000"), ethers.BigNumber.from("1000000000000000000") );`

### Mint And Stake

- Presale Allocation for wallet address
  - `const setAllocationPresaleAllocation = await presaleAllocation.setAllocation( "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // Wallet address ethers.BigNumber.from("1000000000000000000000"), 0 );`
- Add preSale as minter from templeERC20Token
  - `await templeERC20Token.addMinter( "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853" ); // Presale contract addres`
- Check allocation used from preSale contract
  - `const allocationUsed = await contractPresale.allocationUsed( "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" //Wallet account );`
- Increase allowance from simple token
  - `simpleTokenC = await simpleToken.increaseAllowance( "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853", //Presale address ethers.BigNumber.from("1000000000000000000000000") );`
- Mint and stake using contract presale
  - `const mintAndStake = await contractPresale.mintAndStake( ethers.BigNumber.from("1000000000000000000") );`

### Withdraw from exit queue

`Note: 1. Presale time must be in past to withdraw from lockedOg `
`2. OG temple allowance should be done mannually `

- Withdraw locked amount from LockOgTemple
  - Find lock and
  - Then withdraw
- OG Temple allowance
  - Allowance to wallet address, temple staking
  - Increase value for temple staking
  - ` const symbol = await contractOGTemple.allowance( "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", //Wallet address "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" // Staking address ); const increaseAllowance = await contractOGTemple.increaseAllowance( "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", ethers.BigNumber.from("10000000000000000000") );`
- Unstake from temple staking
  `const unstake = await contract.unstake( ethers.BigNumber.from("1000000000000000") );`
- With draw from exit queue
