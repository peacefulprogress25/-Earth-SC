pragma solidity ^0.8.4;
// SPDX-License-Identifier: GPL-3.0-or-later

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./ABDKMath64x64.sol";
import "./EarthERC20Token.sol";
import "./Fruit.sol";
// @audit-report: medium: remove unused imports
import "./ExitQueue.sol";

// import "hardhat/console.sol";

/**
 * Mechancics of how a user can stake earth.
 */

// @audit-report: HIGH: Not providing enough earth to cover the accrued rewards will cause in user losing earth
// Scenario: Two users staking 100 EARTH each and accrue interest over time. 
// After 1 year both users have fruits worth of 150 EARTH each, but only 20 EARTH were added to the pool. 
// Pool balance: 220 EARTH (200 staked, 20 added as rewards)
// Worth of fruit tokens: 300 EARTH (150 each)
// If user1 unstakes his fruits he will get 150 EARTH.
// New Pool balance: 220 EARTH - 150 EARTH = 70 EARTH
// If user2 unstakes his fruits he will only be able to receive the remaining 70 EARTH.
// User2 lost 30 EARTH of his stake and 50 EARTH in rewards.

// @audit-report: info: look into ERC-4626consider using Synthetix Staking contract
contract EarthStaking is Ownable {
    using ABDKMath64x64 for int128;
    EarthERC20Token public immutable EARTH; // The token being staked, for which EARTH rewards are generated
    Fruit public immutable FRUIT; // Token used to redeem staked EARTH

    // @audit-report: move accumulationFactor up here and save a storage slot
    // @audit-report: Add "epoch percentage yield, as an ABDKMath64x64"
    int128 public epy;

    // @audit-report: low: Add "epoch size, in seconds"
    uint256 public epochSizeSeconds;

    // The starting timestamp. from where staking starts
    // @audit-report: medium: can be immutable
    uint256 public startTimestamp;

    // epy compounded over every epoch since the contract creation up
    // until lastUpdatedEpoch. Represented as an ABDKMath64x64
    // @audit-report: medium: move this to L38 to save a storage slot
    int128 public accumulationFactor;

    // the epoch up to which we have calculated accumulationFactor.
    uint256 public lastUpdatedEpoch;

    event StakeCompleted(
        address _staker, // @audit-report: medium: address indexed _staker to enable event filtering based on topic
        uint256 _amount,
        uint256 _lockedUntil // @audit-report: medium: Since locking was removed, this can be removed
    );
    event AccumulationFactorUpdated(
        uint256 _epochsProcessed,
        uint256 _currentEpoch,
        uint256 _accumulationFactor
    );
    event UnstakeCompleted(address _staker, uint256 _amount); // @audit-report: medium: address indexed _staker to enable event filtering based on topic

    // @audit-report: medium: Add zero checks for _EARTH and _startTimestamp
    constructor(
        EarthERC20Token _EARTH,
        uint256 _epochSizeSeconds,
        uint256 _startTimestamp
    ) {
        require(
            _startTimestamp < block.timestamp,
            "Start timestamp must be in the past" // @audit-report: medium: use custom error TIMESTAMP_IN_FUTURE() 
        );
        require(
            _startTimestamp > (block.timestamp - (24 * 2 * 60 * 60)), // @audit-report: medium use custom error TIMESTAMP_BEFORE_2_DAYS() 
            "Start timestamp can't be more than 2 days in the past"
        );

        EARTH = _EARTH;

        // Each version of the staking contract needs it's own instance of Fruit users can use to
        // claim back rewards
        FRUIT = new Fruit();
        epochSizeSeconds = _epochSizeSeconds;
        startTimestamp = _startTimestamp;
        epy = ABDKMath64x64.fromUInt(1); // @audit-report: mediumL epy = 1 (Invoking ABDKMath64x64.fromUInt is redundant )
        accumulationFactor = ABDKMath64x64.fromUInt(1); // @audit-report: medium: accumulationFactor = 1 (Invoking ABDKMath64x64.fromUInt is redundant )
    }

    /** Sets epoch percentage yield */
    function setEpy(
        uint256 _numerator,
        uint256 _denominator
    ) external onlyOwner {
        _updateAccumulationFactor();
        epy = ABDKMath64x64.fromUInt(1).add(
            ABDKMath64x64.divu(_numerator, _denominator)
        );
    }

    /** Get EPY as uint, scaled up the given factor (for reporting) */
    // Remove payable and add view after removing emit
    // @audit-report: medium: remove payable and make it view
    // QUESTION: why have _scale ? -> it's pretty common to use 1e18 to scale
    function getEpy(uint256 _scale) external payable returns (uint256) {
        return
            epy
                .sub(ABDKMath64x64.fromUInt(1))
                .mul(ABDKMath64x64.fromUInt(_scale))
                .toUInt();
    }

    // @audit-report: medium: would recommend adding internal function _currentEpoch and use it within EARTHStaking.sol
    // and make currentEpoch `external` instead of `public`
    function currentEpoch() public view returns (uint256) {
        return (block.timestamp - startTimestamp) / epochSizeSeconds;
    }

    /** Return current accumulation factor, scaled up to account for fractional component */
    function getAccumulationFactor(
        // @audit-report: low: would recommend removing scale and just defaulting it to 1e18
        uint256 _scale
    ) external view returns (uint256) {
        return
            _accumulationFactorAt(currentEpoch())
                .mul(ABDKMath64x64.fromUInt(_scale))
                .toUInt();
    }

    /** Calculate the updated accumulation factor, based on the current epoch */
    // @audit-report: epoch -> _epoch
    function _accumulationFactorAt(
        uint256 epoch
    ) private view returns (int128) {
        uint256 _nUnupdatedEpochs = epoch - lastUpdatedEpoch;
        return accumulationFactor.mul(epy.pow(_nUnupdatedEpochs));
    }

    /** Balance in EARTH for a given amount of FRUIT */
    // @audit-report: low: amountFruit -> _amountFruit
    // @audit-report: medium: make function external, add internal function
    // @audit-report: medium: rename, since name is misleading
    function balance(uint256 amountFruit) public view returns (uint256) {
        return
            _overflowSafeMul1e18(
                ABDKMath64x64.divu(amountFruit, 1e18).mul(
                    _accumulationFactorAt(currentEpoch())
                )
            );
    }

    /** updates rewards in pool */
    function _updateAccumulationFactor() internal {
        uint256 _currentEpoch = currentEpoch();

        // still in previous epoch, no action.
        // NOTE: should be a pre-condition that _currentEpoch >= lastUpdatedEpoch
        //       It's possible to end up in this state if we shorten epoch size.
        //       As such, it's not baked as a precondition
        if (_currentEpoch <= lastUpdatedEpoch) {
            return;
        }

        accumulationFactor = _accumulationFactorAt(_currentEpoch);
        lastUpdatedEpoch = _currentEpoch;
        uint256 _nUnupdatedEpochs = _currentEpoch - lastUpdatedEpoch;
        emit AccumulationFactorUpdated(
            _nUnupdatedEpochs,
            _currentEpoch,
            accumulationFactor.mul(10000).toUInt()
        );
    }

    /** Stake on behalf of a given address. Used by other contracts (like Presale) */
    function stakeFor(
        address _staker,
        uint256 _amountEarth
    ) public returns (uint256 amountFruit) {
        // @audit-report: medium: use custom revert INSUFFICIENT_FRUIT_ALLOWANCE() and replace with if condition
        require(_amountEarth > 0, "Cannot stake 0 tokens");

        _updateAccumulationFactor();

        // This is the reverse of balance function.
        // to get number of earth coins = amountFruit * accumulationFactor
        // to get number of fruit coins = amountEarth / accumulationFactor
        // net past value/genesis value/Fruit Value for the earth you are putting in.
        amountFruit = _overflowSafeMul1e18(
            ABDKMath64x64.divu(_amountEarth, 1e18).div(accumulationFactor)
        ); // didn't understand

        SafeERC20.safeTransferFrom(
            EARTH,
            msg.sender,
            address(this),
            _amountEarth
        );
        FRUIT.mint(_staker, amountFruit);
        emit StakeCompleted(_staker, _amountEarth, 0);

        return amountFruit;
    }

    /** Stake earth */
    function stake(
        uint256 _amountEarth
    ) external returns (uint256 amountFruit) {
        return stakeFor(msg.sender, _amountEarth);
    }

    /** Unstake earth */
    function unstake(uint256 _amountFruit) external {
        // @audit-report: medium: use custom revert INSUFFICIENT_FRUIT_ALLOWANCE() and replace with if condition
        require(
            FRUIT.allowance(msg.sender, address(this)) >= _amountFruit,
            "Insufficient fruit allowance. Cannot unstake"
        );

        _updateAccumulationFactor();
        uint256 unstakeBalanceEarth = balance(_amountFruit);

        FRUIT.burnFrom(msg.sender, _amountFruit);

        SafeERC20.safeTransfer(EARTH, msg.sender, unstakeBalanceEarth);

        emit UnstakeCompleted(msg.sender, _amountFruit);
    }

    function _overflowSafeMul1e18(
        int128 amountFixedPoint
    ) internal pure returns (uint256) {
        uint256 integralDigits = amountFixedPoint.toUInt();
        uint256 fractionalDigits = amountFixedPoint
            .sub(ABDKMath64x64.fromUInt(integralDigits))
            .mul(ABDKMath64x64.fromUInt(1e18))
            .toUInt();
        return (integralDigits * 1e18) + fractionalDigits;
    }
}