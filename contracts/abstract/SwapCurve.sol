// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/IBondingCurve.sol";

// ----------------------------------------------------------------------------
// SwapCurve contract
// ----------------------------------------------------------------------------
abstract contract SwapCurve {
    bytes internal _bondingCurveParameters;
    IBondingCurve internal _coinMaker;

    event LogCoinMakerChanged(address _from, address _to);

    function _changeCoinMaker(address newBonding) internal {
        _coinMaker = IBondingCurve(newBonding);
        emit LogCoinMakerChanged(address(_coinMaker), newBonding);
    }

    function _calculateMintAmountFromBondingCurve(
        uint256 tokens,
        uint256 totalSupply
    ) internal view returns (uint256, uint256) {
        return _coinMaker.calculateMintAmountFromBondingCurve(tokens, totalSupply, _bondingCurveParameters);
    }

    function _calculateBurnAmountFromBondingCurve(
        uint256 tokens,
        uint256 totalSupply
    ) internal view returns (uint256, uint256) {
        return _coinMaker.calculateBurnAmountFromBondingCurve(tokens, totalSupply, _bondingCurveParameters);
    }

    function _price(uint256 totalSupply) internal view returns (uint256) {
        return _coinMaker.price(totalSupply, _bondingCurveParameters);
    }

    function getBondingCurve() public view returns (address) {
        return address(_coinMaker);
    }

    function getParameters() public view returns (bytes memory) {
        return _bondingCurveParameters;
    }
}
