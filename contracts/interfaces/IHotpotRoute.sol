// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IHotpotRoute {
    function swap(
        address fromToken,
        address toToken,
        uint256 amount,
        uint256 minReturn,
        address to,
        uint256 deadline
    ) external;

    function getAmountOut(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view returns (uint256 returnAmount, uint256 raisingTokenAmount);
}
