import "./BaseStrategy.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20VotesComp.sol";

// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.4;

interface IGnosis {
    function getThreshold() external view returns (uint256);

    function isOwner(address owner) external view returns (bool);

    function getOwners() external view returns (address[] memory);
}

contract GnosisStrategy is BaseStrategy {
    function name() external pure returns (string memory) {
        return "Gnosis";
    }

    function getThreshold(
        address ref,
        uint256,
        uint256
    ) external view override returns (uint256) {
        return IGnosis(ref).getThreshold();
    }

    function getPastVotes(
        address ref,
        address account,
        uint256
    ) external view override returns (uint256) {
        if (IGnosis(ref).isOwner(account)) {
            return 1;
        } else {
            return 0;
        }
    }
}
