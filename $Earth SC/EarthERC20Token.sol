pragma solidity ^0.8.4;
// SPDX-License-Identifier: GPL-3.0-or-later

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// CHORE: remove unused import
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
// CHORE: remove unused import
import "@openzeppelin/contracts/security/Pausable.sol";
// IDEA: Ownable could be removed since access control is used. DEFAULT_ROLE_ADMIN == OWNER?
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// CHORE: prefix parameters with underscore (as this is followed in the other contracts)
contract EarthERC20Token is ERC20, ERC20Burnable, Ownable, AccessControl {
    bytes32 public constant CAN_MINT = keccak256("CAN_MINT");

    constructor() ERC20("Earth", "EARTH") {
        _setupRole(DEFAULT_ADMIN_ROLE, owner());
    }

    function mint(address to, uint256 amount) external {
      // GAS_OPTIMIZATION: use custom error instead of require
      require(hasRole(CAN_MINT, msg.sender), "Caller cannot mint");
      _mint(to, amount);
    }

    function addMinter(address account) external onlyOwner {
        // GAS_OPTIMIZATION: use _grantRole as internal function calls are cheaper
        grantRole(CAN_MINT, account);
    }

    function removeMinter(address account) external onlyOwner {
        // GAS_OPTIMIZATION: use _grantRole as internal function calls are cheaper
        revokeRole(CAN_MINT, account);
    }
}