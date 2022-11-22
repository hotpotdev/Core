import "./BalanceOfStrategy.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.4;

contract BalanceOfRatioStrategy is BalanceOfStrategy {
    function name() external pure override returns (string memory) {
        return "BalanceOfRatio";
    }

    function getThreshold(address ref, uint256 thresholdParameter) external view override returns (uint256) {
        return (ERC20Votes(ref).totalSupply() * thresholdParameter) / 10000;
    }
}
