// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/IBondingCurve.sol";

// ----------------------------------------------------------------------------
// SwapCurve contract
// ----------------------------------------------------------------------------
abstract contract SwapCurve {

    IBondingCurve _coinMaker;

    event CoinMakerChanged(address _from, address _to);
    
    function _changeCoinMaker(address newBonding) internal {
        _coinMaker = IBondingCurve(newBonding);
        emit CoinMakerChanged(address(_coinMaker), newBonding);
    }
    
    function _mining(uint256 tokens, uint256 totalSupply) internal view returns(uint256 dx, uint256 dy) {
        return _coinMaker.mining(tokens, totalSupply);
    }
    
    function _burning(uint256 tokens, uint256 totalSupply) internal view returns(uint256 dx, uint256 dy) {
        return _coinMaker.burning(tokens, totalSupply);
    }
    
    function _price(uint256 totalSupply) internal view returns (uint) {
        return _coinMaker.price(totalSupply);
    } 

    function getBondingCurve() public view returns(address) {
        return address(_coinMaker);
    }

}
