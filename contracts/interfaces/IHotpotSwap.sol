// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the hotpot swap
 */
interface IHotpotSwap {
    function mint(address to, uint) external payable;

    function estimateMint(uint) external view returns (uint dx, uint dy, uint gasMint);

    function burn(address to, uint) external payable;

    function estimateBurn(uint) external view returns (uint dx, uint dy, uint gasBurn);

}
