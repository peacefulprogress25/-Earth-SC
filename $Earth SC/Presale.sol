pragma solidity ^0.8.4;
// SPDX-License-Identifier: GPL-3.0-or-later

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./EarthERC20Token.sol";
import "./EarthTreasury.sol";
import "./EarthStaking.sol";

// @audit-issue: M-01 This contract has unused imports, which makes it hard to understand. @recommendation remove `import "./PresaleAllocation.sol"`, `import "./LockedFruit.sol";`, `import "hardhat/console.sol";`, `import "./ERC271.sol";`,
import "./PresaleAllocation.sol";
import "./LockedFruit.sol";
import "hardhat/console.sol";
import "./ERC271.sol";
import "./Nft.sol"; // IDEA: file could be renamed to SoulBound ?

// @audit-issue: M-02 add comments to your code so user can understand whats going on.
/**
 * Presale campaign, which lets users to mint and stake based on current IV and a whitelist
 */
// @audit-issue: M-03 Pausable is imported but never used.  @recommendation add `whenNotPaused` modifier to `mint` function.
contract Presale is Ownable, Pausable {
    // @audit-issue: L-01 Naming convention for constants is `ALL_CAPS`, public state variables should be `camelCase`.
    // @audit-issue: M-04 Declares variables which are set in the constructor and not changed as constants.
    IERC20 public STABLEC; // STABLEC contract address
    EarthERC20Token public EARTH; // EARTH ERC20 contract
    EarthTreasury public TREASURY;
    EarthStaking public STAKING;
    // Nft public NFT; //Staking contract
    SoulBound public SOULBOUND; //New Staking contract

    // presale mint multiple
    uint256 public mintMultiple;

    // @audit-issue: L-02 Fix spelling decimalMintMultiple
    uint256 public decamicalplacemintMultiple = 10;
    // How much allocation has each user used.

    event MintComplete(
        address minter, // @audit-issue: L-03 Minter address is not indexed. @recommendation: Change yo `address indexed minter`
        uint256 acceptedStablec,
        uint256 mintedTemple, // @audit-issue: rename to mintedEarth
        uint256 mintedFruit
    );

    // @audit-issue: M-05 The visibility of the state variable is not explicitly defined, which can lead to unwanted behavior. @recommendation add `public` visibility to `mintedrecord`.
    mapping(uint256 => bool) mintedrecord; // @audit-issue: L-03 It's recommended to use camelCase for variable name. Rename to mintedRecord

    constructor(
        // simple token
        IERC20 _STABLEC,
        EarthERC20Token _EARTH,
        EarthStaking _STAKING,
        EarthTreasury _TREASURY,
        uint256 _mintMultiple,
        // Nft _NFT
        SoulBound _SOULBOUND
    ) {
    // @audit-issue: M-06 The contract can be initialized with a zero address, which will could lead to unwanted behavior. @recommendation add zero address checks for `_STABLEC`, `_EARTH`, `_STAKING`, `_TREASURY`, `_SOULBOUND`.
        STABLEC = _STABLEC;
        EARTH = _EARTH;
        STAKING = _STAKING;
        TREASURY = _TREASURY;

        mintMultiple = _mintMultiple;
        // NFT = _NFT;
        SOULBOUND = _SOULBOUND;
    }

    // @audit-issue: L-04 This contract contains unused code. @recommendation: Remove unused code
    // function updateNftaddress(Nft _NFT) external onlyOwner {
    //     NFT = _NFT;
    // }

    // @audit-issue: L-05 It's recommended to use camelCase for variable name. Rename to `updateNftAddress`
    function updateNftaddress(SoulBound _SOULBOUND) external onlyOwner {
        // @audit-issue: add zero checks
        SOULBOUND = _SOULBOUND;

        // @audit-issue: emit event
    }

    // @audit-issue: L-06 `updateMintMuliple` is misspelled, it should be `updateMintMultiple`
    function updateMintMuliple(uint256 _mintMultiple) public onlyOwner {
        // add zero checks
        // @audit-issue: M-07 The `mintMultiple` can be set to 0, which could lead to unwanted behavior. @recommendation add zero check for `_mintMultiple`.
        mintMultiple = _mintMultiple;
        // @audit-issue: M-08 Function which changes state should emit an event. @recommendation add event
    }

    /**
     * Pause contract. Either emergency or at the end of presale
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * Revert pause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // added mint v1
    function mint(uint256 _amountPaidStablec) external {
        // require(NFT.balanceOf(msg.sender) > 0, "you own o nfts");

        // @audit-issue: M-09 `require` statements are more expensive than error. @recommendation: Use custom error instead of require
        require(SOULBOUND.balanceOf(msg.sender) > 0, "you own o nfts");
        require(_amountPaidStablec > 0, "amount must be greater then zero");

        // @audit-issue: M-10 The allowance check happens in the ERC-20 token contract. Therefore this check only costs additional gas. @recommendation: Remove allowance check
        require(
            STABLEC.allowance(msg.sender, address(this)) >= _amountPaidStablec,
            "Insufficient stablecoin allowance"
        );

        (uint256 _stablec, uint256 _earth) = TREASURY.intrinsicValueRatio();
        // 1:2 ratio

        // @audit-issue: M-11 console.log is used in production code. @recommendation: Remove console log
        console.log("_amountPaidStablec", _amountPaidStablec);

        // @audit-issue: medium: would recomment scaling to 1e18 for percision
        uint256 _earthMinted = (10 * _amountPaidStablec * _earth) /
            _stablec /
            mintMultiple;

        // pull stablec from staker and immediately transfer back to treasury

        SafeERC20.safeTransferFrom(
            STABLEC,
            msg.sender,
            address(TREASURY),
            _amountPaidStablec
        );

        EARTH.mint(msg.sender, _earthMinted); //user getting earth tokens
    }
}
