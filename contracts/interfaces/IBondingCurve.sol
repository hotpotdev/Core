// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// ----------------------------------------------------------------------------
// IBindingCurve contract
// ----------------------------------------------------------------------------

interface IBondingCurve {
    // Processing logic must implemented in subclasses

    function mining(uint256 tokens, uint256 totalSupply) external view returns(uint256 x, uint256 y);

    function burning(uint256 tokens, uint256 totalSupply) external view returns(uint256 x, uint256 y);

    function price(uint256 totalSupply) external view returns(uint256 price);
}
