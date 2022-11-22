import "../../interfaces/IStrategy.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.4;

abstract contract BaseStrategy is IStrategy {
    function getThreshold(address, uint256 thresholdParameter) external view virtual override returns (uint256) {
        return thresholdParameter;
    }

    function getPastVotes(
        address ref,
        address account,
        uint256 blockNumber
    ) external view virtual override returns (uint256) {
        return ERC20Votes(ref).getPastVotes(account, blockNumber);
    }
}
