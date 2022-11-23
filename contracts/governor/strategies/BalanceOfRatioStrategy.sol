import "./BalanceOfStrategy.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.4;

contract BalanceOfRatioStrategy is BalanceOfStrategy {
    function name() external pure override returns (string memory) {
        return "BalanceOfRatio";
    }

    function getThreshold(
        address ref,
        uint256 thresholdParameter,
        uint256 blockNumber
    ) external view override returns (uint256) {
        require(
            thresholdParameter > 0 && thresholdParameter < 10000,
            "the threshold of ratio strategy must greater than 0 or less than 10000"
        );
        return (ERC20Votes(ref).getPastTotalSupply(blockNumber) * thresholdParameter) / 10000;
    }
}
