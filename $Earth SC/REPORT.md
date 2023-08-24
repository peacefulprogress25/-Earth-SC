# Review Report

We have reviewed the following contracts: 
- `EarthToken.sol`
- `EarthStaking.sol`
- `EarthTreasury.sol`
- `ERC271.sol`
- `Fruits.sol`
- `MintAllowance.sol`
- `Nft.sol`
- `Presale.sol`
- `PresaleAllocation.sol`
- `StablecCoin.sol`. 

Below is the summary of the identified issues based on severity:

## Table of Contents
- [Review Report](#review-report)
  - [Table of Contents](#table-of-contents)
  - [Severity Levels](#severity-levels)
  - [Overall Findings](#overall-findings)
  - [General Recommendations](#general-recommendations)
  - [EarthERC20Token.sol](#eartherc20tokensol)
    - [Summary of Severities](#summary-of-severities)
    - [Medium](#medium)
    - [Info](#info)
  - [EarthStaking.sol](#earthstakingsol)
    - [Summary of Severities](#summary-of-severities-1)
    - [High](#high)
    - [Medium](#medium-1)
    - [Low](#low)
  - [EarthTreasury.sol](#earthtreasurysol)
    - [Summary of Severities](#summary-of-severities-2)
    - [Medium](#medium-2)
    - [Low](#low-1)
  - [ERC271.sol](#erc271sol)
    - [Summary of Severities](#summary-of-severities-3)
    - [Info](#info-1)
  - [Fruits.sol](#fruitssol)
    - [Summary of Severities](#summary-of-severities-4)
    - [Medium](#medium-3)
  - [MintAllowance.sol](#mintallowancesol)
    - [Summary of Severities](#summary-of-severities-5)
    - [Medium](#medium-4)
    - [Low](#low-2)
  - [Nft.sol](#nftsol)
    - [Summary of Severities](#summary-of-severities-6)
    - [Medium](#medium-5)
    - [Low](#low-3)
    - [Info](#info-2)
  - [Presale.sol](#presalesol)
    - [Summary of Severities](#summary-of-severities-7)
    - [Medium](#medium-6)
    - [Low](#low-4)
  - [PresaleAllocation.sol](#presaleallocationsol)
    - [Summary of Severities](#summary-of-severities-8)
  - [Medium](#medium-7)
    - [Low](#low-5)
    - [Info](#info-3)
  - [StableCoin.sol](#stablecoinsol)
    - [Summary of Severities](#summary-of-severities-9)
    - [Info](#info-4)


## Severity Levels

- **High:** Represents a high-impact vulnerability that can lead to significant issues, though not as severe as critical vulnerabilities.
- **Medium:** Represents a medium-level vulnerability that can lead to certain issues but with limited impact.
- **Low:** Represents a low-level vulnerability that might not pose significant risks but should still be addressed for best practices.
- **Info:** Provides information or suggestions without posing a direct security threat.

## Overall Findings

- **High:** 2 issues
- **Medium:** 36 issues
- **Low:** 17 issues
- **Info:** 5 issues

## General Recommendations

1. **Writing Extensive Test Cases:** We recommend writing comprehensive test cases for the entire system. Testing each unit and scenario thoroughly is essential to ensure the robustness and reliability of the protocol.
2. **Compiler Version Consistency:** It's recommended to use the same compiler version throughout all contracts to maintain consistency and avoid potential compatibility issues.
3. **License Consistency:** Consider using the same license (e.g., GPL-3.0-or-later) across all contracts to ensure clarity about licensing terms and open-source distribution.
4. **Code Comments:** Adding comprehensive comments to the codebase using NatSpec format can significantly improve the readability and understandability of the code for developers and users.
5. **Removing Unused Code:** Remove any unused files, functions, and imports from the codebase to keep it clean and easy to navigate.
6. **Oracle Contract for Real-World Assets:** For improved accuracy and robustness, consider integrating an oracle contract to automatically calculate the underlying asset values based on real-world data, instead of manually calculating these values.
   Consider implementing a flexible mechanism for updating the asset values in the Treasury using the oracle contract. An option could be using an oracle-like contract with adjustable asset values that can be set manually, enabling future governance decisions and potential integration with actual oracles. Launching with a custom oracle-like contract gives you the flexibility to make these changes without significantly changing the protocol in the future. 
7. **Documentation:** Provide thorough and clear documentation for the entire protocol. This documentation should cover how the protocol works, its various components, roles, responsibilities, and interfaces.
8. **Upgradeable Contracts**: As this protocol will continue to have iterations after it's intial launch, our recommendation would be have the core contracts `EarthStaking` and `EarthTreasury` as upgradeable to avoid having to redeploy the protocol and transfer assets to the newer contracts. We recommend using [openzeppelin upgradeable](https://docs.openzeppelin.com/learn/upgrading-smart-contracts#limitations-of-contract-upgrades) and updating the deploy scripts to use [hardhat-upgrades](https://docs.openzeppelin.com/upgrades-plugins/1.x/). 


By addressing these recommendations, the protocol will be better prepared to handle real-world usage and development, ensuring its security, usability, and future expansion.

Please note that this review is based on the code provided, and actual testing and security audits are essential before deployment to ensure the protocol's safety and correctness.


## EarthERC20Token.sol

**Contract Description:** The `EarthERC20Token` contract is an ERC20 token with added functionality for minting and access control. It's written in Solidity 0.8.4 and is licensed under the GPL-3.0-or-later.

### Summary of Severities

* High: 0 issues
* Medium: 1 issue
* Low: 0 issues
* Info: 2 issues

### Medium

**M-01** `line: 5` `line: 7`

* **Issue:** The contract contains unused imports that can be removed to improve code clarity.
* **Recommendation:** Remove the unused imports to improve code clarity.

### Info

**I-01**

* **Issue:** The contract adds the `Ownable` and `AccessControl` features to manage access, but it also assigns the `DEFAULT_ADMIN_ROLE` role to the owner. This duplication might not be necessary and should be reviewed.
* **Recommendation:** Consider removing the `Ownable` inheritance and directly using the `AccessControl` features, ensuring that they are appropriately configured to suit your requirements.

**I-02**

* **Issue:** The contract uses `onlyOwner` modifier in the `addMinter` and `removeMinter` functions, which implies that only the owner can grant or revoke the `CAN_MINT` role. However, this might be redundant since the `AccessControl` library is being used to handle roles.
* **Recommendation:** Consider removing the `onlyOwner` modifier from the `addMinter` and `removeMinter` functions if the access control roles are sufficient to enforce the intended behavior.

## EarthStaking.sol

**Contract Description:** The contract is named `EarthStaking` and is used to handle the mechanics of users staking Earth tokens and generating rewards in the form of Fruit tokens. The contract version is written in Solidity 0.8.4 and is licensed under the GPL-3.0-or-later.

### Summary of Severities

* High: 1 issue
* Medium: 8 issues
* Low: 3 issue
* Info: 0 issues

### High

**H-01**

* **Issue:** Not providing enough Earth to cover the accrued rewards will cause the user to lose Earth.
* **Scenario:** 
  - Two users stake 100 EARTH each and accrue interest over time. 
  - After 1 year, both users have fruits worth 150 EARTH each and only 20 EARTH was added to the pool. 
  - Pool balance: 220 EARTH (200 staked, 20 added as rewards). 
  - Worth of fruit tokens: 300 EARTH (150 per user). 
  - If user1 unstakes his fruits, he will get 150 EARTH. 
  - New Pool balance: 220 EARTH - 150 EARTH = 70 EARTH. 
  - If user2 unstakes his fruits, he will only be able to receive the remaining 70 EARTH. 
  - User2 lost 30 EARTH of his stake and 50 EARTH in rewards.
* **Recommendation:** Review the staking and reward distribution mechanism to ensure that users are not at risk of losing their staked Earth or rewards. Consider implementing a more balanced reward distribution mechanism or using established staking contract such as the Synthetix Staking contract.

### Medium

**M-01** `line: 53` `line: 57` `line: 153` `line 183`

* **Issue:** Use custom error statements instead of require to save gas.
* **Recommendation:** Add custom error statements.

**M-02** `line: 10` `line: 12`

* **Issue:** The contract should remove the unused imports to improve code clarity.
* **Recommendation:** Remove the unused imports to improve code clarity.

**M-03** `line: 27`

* **Issue:** The `startTimestamp` variable can be made immutable since it's set during contract deployment and doesn't need to be modified afterward.
* **Recommendation:** Declare the `startTimestamp` variable as immutable.

**M-04** `line: 69` `line: 70`

* **Issue:** The `epy` and `accumulationFactor` variables are being initialized with the same value (`ABDKMath64x64.fromUInt(1)`). The invocation of `ABDKMath64x64.fromUInt` is redundant.
* **Recommendation:** Initialize the `epy` and `accumulationFactor` variables directly with the integer value 1.

**M-05** `line: 117`

* **Issue:** The `balance` function can be made `external` to improve gas efficiency and reduce potential stack depth issues.
* **Recommendation:** Change the visibility of the `balance` function to `external`.

**M-06** `line: 117`

* **Issue:** The name `balance` is misleading.
* **Recommendation:** The function `balance` should be renamed to something more descriptive.

**M-07**

* **Issue:** The `getEpy` and `getAccumulationFactor` functions can be made `view` instead of `payable` since they don't modify state and don't require payment.
* **Recommendation:** Change the visibility of the `getEpy` and `getAccumulationFactor` functions to `view`.


**M-07**

* **Issue:** Extra storage slot which can be remove 
* **Recommendation:** Move `accumulationFactor` below `epy` to ensure that both storage variables can be stored in the same storage slot (256 bits)

### Low

**L-01**

* **Issue:** The contract contains an unused import that can be removed to improve code clarity.
* **Recommendation:** Remove the unused import to improve code clarity.

**L-02**

* **Issue:** The variable `amountFruit` is using an incorrect identifier naming convention.
* **Recommendation:** Correct the naming of the parameter `amountFruit` to `_amountFruit`.

**L-03**

* **Issue:** `getAccumulationFactor` can be scaled to `1e18`. Passing an `_scale` as an argument is redundant
* **Recommendation:** Stick to scaling to `1e18` as opposed to scaling based on `_scale`.

## EarthTreasury.sol

**Contract Description:** The `EarthTreasury` contract manages the Earth token treasury, its rewards, and allocations to various investment pools. It's written in Solidity 0.8.4 and is licensed under the GPL-3.0-or-later.

### Summary of Severities

* High: 1 issues
* Medium: 5 issues
* Low: 3 issue
* Info: 0 issues

### High

**H-01** `line: 197` `line: 213

* **Issue:** Intrinsic ratio is not updated when Earth is minted or burned
* **Recommendation**: Recommend updating `EarthTreasury` when invoking `unallocateAndBurnUnusedMintedEarth` and `mintAndAllocateEarth`

### Medium

**M-01** `line: 5` `line: 13`

* **Issue:** The contract contains an unused import that can be removed to improve code clarity.
* **Recommendation:** Remove the unused import to improve code clarity.

**M-02** `lines: 17-20`

* **Issue:** The `EARTH` and `STABLEC` variables could be prefixed with underscores (`_`) to indicate that they are private variables.
* **Recommendation:** Prefix the `EARTH` and `STABLEC` variables with underscores to indicate that they are private.

**M-03** `line: 69` `line: 91` `line: 112` `line: 175` `line: 203` `line: 247` `line: 286` `lins: 305-306`

* **Issue:** The contract could make use of custom error messages in some require statements.
* **Recommendation:** Add custom error messages to the require statements to provide more informative error messages for users.

**M-04** `line: 52`

* **Issue:** The contract constructor can be initialized with a zero address for certain parameters.
* **Recommendation:** Add zero address checks for the constructor parameters `_STABLEC` and `_EARTH`.

**M-05** `lines: 65-83` `lines: 137-144` `lines: 213-220` `lines: 262-277` `lines: 282-299` `lines: 304-315`

* **Issue:** The contract lacks event emissions for state-changing functions.
* **Recommendation:** Emit events for the relevant state-changing functions to provide transparency and track changes.

### Low

**L-01**

* **Issue:** The contract contains a variable named `seeded` that is assigned to `false` but the assignment can be removed since it's already initialized to `false` by default.
* **Recommendation:** Remove the assignment of `seeded = false`.

**L-02** `line: 35`

* **Issue:** The `_contract_` address in the `HarvestDistributed` event is not indexed.
* **Recommendation:** Change the `_contract` address in the event to an indexed parameter.


**L-02** `line: 340`

* **Issue:** Removing a pool does not drain EARTH tokens allocated to pool
* **Recommendation:** Consider invoking `ejectTreasuryAllocation` when removing Pool

## ERC271.sol

**Contract Description:** The contract is named `MyToken` and is a standard ERC-721 implementation. The contract version is written in Solidity 0.8.4 and is licensed under the MIT.

### Summary of Severities

* High: 0 issues
* Medium: 0 issues
* Low: 0 issues
* Info: 1 issues

### Info

**I-01**

* **Issue:** The contract is unused and can be removed from the codebase.
* **Recommendation:** Remove the unused `ERC271.sol` contract to simplify the codebase.

## Fruits.sol

**Contract Description:** The contract is named `Fruits` and is used as the protocols staking token.

### Summary of Severities

* High: 0 issues
* Medium: 1 issue
* Low: 0 issues
* Info: 0 issues

### Medium

**M-01**

* **Issue:** The contract contains unused imports, which can make the code harder to understand.
* **Recommendation:** Remove the unused imports to improve code clarity.

## MintAllowance.sol

**Contract Description:** The contract is named `MintAllowance` and is used to manage newly minted Earth token allocations to various Earth strategies. The contract version is written in Solidity 0.8.4 and is licensed under the GPL-3.0-or-later.

### Summary of Severities

* High: 0 issues
* Medium: 3 issue
* Low: 1 issues
* Info: 0 issues

### Medium

**M-01**

* **Issue:** The `EarthERC20Token` contract address should be made immutable.
* **Recommendation:** Declare the `EarthERC20Token` contract address as an immutable variable to prevent accidental modification.

**M-02**

* **Issue:** The `EarthERC20Token` contract address should be marked as public.
* **Recommendation:** Declare the `EarthERC20Token` contract address as public.

**M-03**

* **Issue:** The contract contains unused imports, which can make the code harder to understand.
* **Recommendation:** Remove the unused imports to improve code clarity.

### Low

**L-01**

* **Issue:** It is recommended to use lowercase for variable names.
* **Recommendation:** Rename the `EarthERC20Token` variable from `EARTH` to `earth` to follow the lowercase variable naming convention.

## Nft.sol

**Contract Description:** The contract is named `Soulbound` and is an ERC721 token contract used to manage minting, burning, and ownership of SoulBound tokens. The contract version is written in Solidity 0.8.15 and is licensed under the MIT License.

### Summary of Severities

* High: 0 issues
* Medium: 4 issues
* Low: 3 issues
* Info: 1 issues

### Medium

**M-01** `line: 4`

* **Issue:** The contract uses the `ERC721URIStorage` extension, but it could consider removing it in favor of using the `tokenURI` function directly.
* **Recommendation:** Consider removing the `ERC721URIStorage` extension and relying solely on the `tokenURI` function. Update the `tokenURI` function to provide the appropriate URI for each token.

**M-02** `lines: 25-31`

* **Issue:** The `updateUri` function sets the new URI for all tokens by looping through each tokenId. This approach may not scale well if the number of tokens increases significantly.
* **Recommendation:** Instead of looping through all tokens to update the URI, update the `baseURI` directly and ensure that the `tokenURI` function returns the correct URI for each token.

**M-03**
* **Issue:** The contract could benefit from using custom error messages instead of relying on `require` statements for better gas optimization.
* **Recommendation:** Use custom error messages for the `addToWhiteList` function to provide clearer error information.

**M-04** `line: 100` `line: 111` `line: 116`
* **Issue:** Function which are declared as `public` are more expensive then `external` functions.
* **Recommendation:** Change function visibility from `public` to `external`.

### Low

**L-01**

* **Issue:** The contract contains unused imports, which can make the code harder to understand.
* **Recommendation:** Remove the unused imports to improve code clarity.

**L-02**

* **Issue:** The contract does not follow a consistent code style, making it less readable.
* **Recommendation:** Use consistent formatting and indentation, such as using proper line breaks and spacing, to improve code readability.

**L-03**

* **Issue:** The `changeOwner` function could be removed in favor of using the `Ownable` contract to manage ownership.
* **Recommendation:** Use the `Ownable` contract to manage ownership instead of having a separate `changeOwner` function.


### Info

**I-01**
* **Issue:** The file is named `Nft.sol` but the contract itself `Soulbound` whic is inconsistent.
* **Recommendation:** Rename `Nft.sol` to `Soulbound.sol`.

## Presale.sol

**Contract Description:** The contract is named `Presale` and is used for a presale campaign allowing users to mint and stake tokens based on certain conditions. The contract interacts with the STABLEC ERC20 token, EarthERC20Token, EarthTreasury, EarthStaking, and SoulBound contracts. The purpose of this contract is to enable users to participate in a presale by minting and staking tokens. The contract version is written in Solidity 0.8.4 and is licensed under the GPL-3.0-or-later.

### Summary of Severities

* High: 0 issue
* Medium: 12 issues
* Low: 6 issues
* Info: 0 issues

### Medium 

**M-01**

* **Issue:** The contract lacks comments, making it difficult for developers to understand the code's purpose and functionality.
* **Recommendation:** Add comments to explain the purpose and functionality of the code.

**M-02** `lines: 11-14`

* **Issue:** The contract contains unused imports, which can make the code harder to understand and maintain.
* **Recommendation:** Remove the unused imports to improve code clarity.

**M-03** `line: 20`

* **Issue:** The `Pausable` contract is imported but not used in the contract.
* **Recommendation:** Implement the `whenNotPaused` modifier for the `mint` function to ensure it can only be called when the contract is not paused.

**M-04** `lines: 21-26` `lines: 43-61`

* **Issue:** The contract declares variables that are set in the constructor and not modified afterward.
* **Recommendation:** Declare the variables that are set in the constructor as constants.

**M-05** `lines: 41`

* **Issue:** The visibility of the `mintedrecord` mapping is not explicitly defined.
* **Recommendation:** Define the visibility of the `mintedrecord` mapping as public to ensure proper access control.

**M-06** `lines: 43-61`

* **Issue:** The contract constructor can be initialized with a zero address for certain parameters.
* **Recommendation:** Add zero address checks for the constructor parameters `_STABLEC`, `_EARTH`, `_STAKING`, `_TREASURY`, and `_SOULBOUND`.

**M-07** `lines: 71-72`

* **Issue:** The `mintMultiple` variable can be set to 0 in the `updateMintMuliple` function.
* **Recommendation:** Add a zero check for the `_mintMultiple` parameter before updating the `mintMultiple` variable.

**M-08** `lines: 71-72`

* **Issue:** The `updateMintMuliple` function changes the state but does not emit an event.
* **Recommendation:** Emit an event after the state change in the `updateMintMuliple` function for transparency.

**M-09**

* **Issue:** The `require` statements used in this contract can be more expensive than custom error messages.
* **Recommendation:** Use custom error messages instead of `require` statements to optimize gas consumption.

**M-10** `lines: 94-97`

* **Issue:** The allowance check for `STABLEC` is redundant as it is already checked in the ERC-20 token contract.
* **Recommendation:** Remove the allowance check for `STABLEC` in the `mint` function to reduce gas consumption.

**M-11** `line: 101`

* **Issue:** The `console.log` statement is used in the production code.
* **Recommendation:** Remove the `console.log` statement to prevent unexpected behavior in production.

**M-11** `line: 128`

* **Issue:** In `_earthMinted` multiplying `10` will work for now but if you need more percision scaling to get 2 decimals would require contract changes.
* **Recommendation:** Update `_earthMinted` by replacing `10` with `1e18`


### Low

**L-01** `lines: 21-26`

* **Issue:** The naming convention for variables is inconsistent.
* **Recommendation:** Rename the constants to follow the `ALL_CAPS` and public variables to follow the `camelCase` naming conventions.

**L-02**  `line: 31`

* **Issue:** There's a spelling mistake in the variable name `decamicalplacemintMultiple.`
* **Recommendation:** Correct the variable name to `decimalplaceMintMultiple.`

**L-03** `line: 35`

* **Issue:** The `minter` address in the `MintComplete` event is not indexed.
* **Recommendation:** Change the `minter` address in the event to an indexed parameter for query efficiency.

**L-04** `lines: 63-65`

* **Issue:** The contract contains unused code in the form of the `updateNftaddress` function.
* **Recommendation:** Remove the unused `updateNftaddress` function to simplify the code.

**L-05**  `line: 67`

* **Issue:** The function `updateNftaddress` should be renamed to `updateNftAddress.`
* **Recommendation:** Rename the function `updateNftaddress` to `updateNftAddress` for consistency.

**L-06** `line: 71`

* **Issue:** The variable `updateMintMuliple`  is misspelled should be renamed to `updateMintMultiple.`
* **Recommendation:** Rename the function `updateMintMuliple` to `updateMintMultiple`.


## PresaleAllocation.sol

**Contract Description:** The contract is named `PresaleAllocation` and is used to manage allocations for addresses during the presale period. The contract version is written in Solidity 0.8.4 and is licensed under the GPL-3.0-or-later.

### Summary of Severities

* High: 0 issues
* Medium: 1 issues
* Low: 1 issues
* Info: 1 issues

## Medium

**M-01** `lines: 4-10`

* **Issue:** The contract contains unused imports, which can make the code harder to understand and maintain.
* **Recommendation:** Remove the unused imports to improve code clarity.

### Low

**L-01** `line: 24`

* **Issue:** The `setAllocation` function does not have a clear description of its purpose.
* **Recommendation:** Add a comment to describe the purpose and functionality of the `setAllocation` function.

### Info

**I-01**

* **Issue:** The contract is unused and can be removed from the codebase.
* **Recommendation:** Remove the unused `PresaleAllocation.sol` contract to simplify the codebase.

## StableCoin.sol

**Contract Description:** The contract is named `StableCoin` and is used for testing purposes. The contract version is written in Solidity 0.8.4 and is licensed under MIT.

### Summary of Severities

* High: 0 issues
* Medium: 1 issues
* Low: 0 issues
* Info: 0 issues

### Info

**I-01**

* **Issue:** The contract is unused and can be removed from the contracts folder.
* **Recommendation:**  Create a dedicated folder for testing contracts/mocks and remove the unused `StableCoin.sol` contract from the main folder to simplify the codebase.
