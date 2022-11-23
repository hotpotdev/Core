// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

// openzeppelin
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// diy
import "../interfaces/IBondingCurve.sol";
import "../libraries/ABDKMath.sol";

contract LinearMixedBondingSwap is IBondingCurve {
    using ABDKMath for uint256;

    string public constant BondingCurveType = "linear";

    function getParameter(bytes memory data) private pure returns (uint256 k, uint256 p) {
        (k, p) = abi.decode(data, (uint256, uint256));
        require(k <= 100000 && k > 0, "Create: Invalid k");
        require(p <= 1e24 && p >= 0, "Create: Invalid p");
    }

    // x => erc20, y => native
    // p(x) = x / k + p
    function calculateMintAmountFromBondingCurve(
        uint256 nativeTokenAmount,
        uint256 daoTokenCurrentSupply,
        bytes memory parameters
    ) public pure override returns (uint256 daoTokenAmount, uint256) {
        (uint256 k, uint256 p) = getParameter(parameters);
        uint256 daoTokenCurrentPrice = daoTokenCurrentSupply / k + p;
        daoTokenAmount =
            ((daoTokenCurrentPrice * daoTokenCurrentPrice + (2 * nativeTokenAmount * 1e18) / k).sqrt() -
                daoTokenCurrentPrice) *
            k;
        return (daoTokenAmount, nativeTokenAmount);
    }

    function calculateBurnAmountFromBondingCurve(
        uint256 daoTokenAmount,
        uint256 daoTokenCurrentSupply,
        bytes memory parameters
    ) public pure override returns (uint256, uint256 nativeTokenAmount) {
        (uint256 k, uint256 p) = getParameter(parameters);
        uint256 daoTokenCurrentPrice = daoTokenCurrentSupply / k + p;
        nativeTokenAmount = (daoTokenCurrentPrice * daoTokenAmount - ((daoTokenAmount * daoTokenAmount) / k) / 2) / 1e18;
        return (daoTokenAmount, nativeTokenAmount);
    }

    function price(uint256 daoTokenCurrentSupply, bytes memory parameters) public pure override returns (uint256) {
        (uint256 k, uint256 p) = getParameter(parameters);
        return daoTokenCurrentSupply / k + p;
    }
}
