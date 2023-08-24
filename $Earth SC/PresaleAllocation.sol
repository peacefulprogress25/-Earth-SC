pragma solidity ^0.8.4;
// SPDX-License-Identifier: GPL-3.0-or-later

// CHORE: remove unused imports
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// CHORE: remove unused imports
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// CHORE: remove unused imports
import "./EarthERC20Token.sol";
// CHORE: remove unused imports
import "./EarthTreasury.sol";
// CHORE: remove unused imports
import "./EarthStaking.sol";

// CHORE: Contract unused, can be removed
/**
 * Who has what allocation in the presale period
 */
contract PresaleAllocation is Ownable {
    struct Allocation {
      uint256 amount;
      uint256 epoch;
    }

    // maximum stablec each address can buy earth
    mapping(address => Allocation) public allocationOf;

    function setAllocation(address staker, uint256 amount, uint256 epoch) external onlyOwner {
      allocationOf[staker].epoch = epoch;
      allocationOf[staker].amount = amount;
    }
}