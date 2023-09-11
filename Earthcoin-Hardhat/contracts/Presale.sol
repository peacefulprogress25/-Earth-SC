// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./EarthERC20Token.sol";
import "./EarthTreasury.sol";
import "./EarthStaking.sol";
import "./SoulBound.sol";

/**
 * Presale campaign, which lets users mint and stake based on current IV and a whitelist
 */
contract Presale is Ownable, Pausable {
    IERC20 public STABLEC; // STABLEC contract address
    EarthERC20Token public EARTH; // EARTH ERC20 contract
    EarthTreasury public TREASURY;
    EarthStaking public STAKING;
    SoulBound public SOULBOUND; // New Staking contract

    // Presale mint multiple
    uint256 public mintMultiple;

    // Decimal mint multiple
    uint256 public decimalMintMultiple = 10;

    event MintComplete(
        address indexed minter,
        uint256 acceptedStablec,
        uint256 mintedEarth,
        uint256 mintedFruit
    );

    event NftAddressUpdated(
        address indexed oldAddress,
        address indexed newAddress
    );

    event MintMultipleUpdated(uint256 newMintMultiple);

    mapping(uint256 => bool) public mintedRecord;

    constructor(
        IERC20 _STABLEC,
        EarthERC20Token _EARTH,
        EarthStaking _STAKING,
        EarthTreasury _TREASURY,
        uint256 _mintMultiple,
        SoulBound _SOULBOUND
    ) {
        require(
            address(_STABLEC) != address(0) &&
                address(_EARTH) != address(0) &&
                address(_STAKING) != address(0) &&
                address(_TREASURY) != address(0) &&
                address(_SOULBOUND) != address(0),
            "Zero address not allowed"
        );

        STABLEC = _STABLEC;
        EARTH = _EARTH;
        STAKING = _STAKING;
        TREASURY = _TREASURY;
        mintMultiple = _mintMultiple;
        SOULBOUND = _SOULBOUND;
    }

    function updateNftAddress(SoulBound _SOULBOUND) external onlyOwner {
        require(address(_SOULBOUND) != address(0), "Zero address not allowed");
        emit NftAddressUpdated(address(SOULBOUND), address(_SOULBOUND));
        SOULBOUND = _SOULBOUND;
    }

    function updateMintMultiple(uint256 _mintMultiple) external onlyOwner {
        require(_mintMultiple > 0, "Mint multiple must be greater than zero");
        mintMultiple = _mintMultiple;
        emit MintMultipleUpdated(_mintMultiple);
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

    function mint(uint256 _amountPaidStablec) external whenNotPaused {
        require(SOULBOUND.balanceOf(msg.sender) > 0, "Must own NFTs");
        require(_amountPaidStablec > 0, "Amount must be greater than zero");

        (uint256 _stablec, uint256 _earth) = TREASURY.intrinsicValueRatio();

        uint256 _earthMinted = (10e18 * _amountPaidStablec * _earth) /
            _stablec /
            mintMultiple;

        SafeERC20.safeTransferFrom(
            STABLEC,
            msg.sender,
            address(TREASURY),
            _amountPaidStablec
        );

        EARTH.mint(msg.sender, _earthMinted);
    }
}
