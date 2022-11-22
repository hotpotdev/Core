import "./BaseStrategy.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.4;

contract BalanceOfStrategy is BaseStrategy {
    function name() external pure virtual returns (string memory) {
        return "BalanceOf";
    }

    function getPastVotes(
        address ref,
        address account,
        uint256 blockNumber
    ) external view override returns (uint256) {
        return ERC20Votes(ref).getPastVotes(account, blockNumber);
    }
}
