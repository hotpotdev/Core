// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the hotpot swap
 */
interface IHotpotSwap {
    function mint(address to, uint) external payable returns (uint);

    function estimateMint(
        uint nativeAmount
    ) external view returns (uint daoTokenAmount, uint nativeTokenPaidAmount, uint platformFee, uint projectFee);

    function estimateMintNeed(
        uint tokenAmountWant
    ) external view returns (uint daoTokenAmount, uint nativeTokenPaidAmount, uint platformFee, uint projectFee);

    function burn(address to, uint, uint) external returns (uint);

    function estimateBurn(
        uint tokenAmount
    ) external view returns (uint daoTokenAmountNedd, uint nativeTokenPaidAmount, uint platformFee, uint projectFee);
}
