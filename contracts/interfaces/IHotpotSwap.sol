// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the hotpot swap
 */
interface IHotpotSwap {
    function mint(address to, uint) external payable;

    function estimateMint(uint) external view returns (uint daoTokenAmount, uint nativeTokenPaidAmount, uint platformFee, uint projectFee);

    function burn(address to, uint) external;

    function estimateBurn(uint) external view returns (uint daoTokenAmount, uint nativeTokenPaidAmount, uint platformFee, uint projectFee);

}
