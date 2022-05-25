// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the hotpot swap
 */
interface IHotpotToken {
    
    function setMetadata(string memory url) external;

    function getMetadata() external view returns (string memory);

    function getTaxRate() external view returns(uint _projectMintRate,uint projectBurnRate,uint platformMintRate,uint platformBurnRate);

    function platform() external view returns(address);

    function treasury() external view returns(address);

    function cap() external view returns(uint cap);

    function premint() external view returns(bool);

    function normalizeMint() external; 

    function price() external view returns (uint);

    function mint(address to, uint) external payable;

    function estimateMint(uint) external view returns (uint dx, uint dy, uint gasMint);

    function burn(address to, uint) external payable;

    function estimateBurn(uint) external view returns (uint dx, uint dy, uint gasBurn);

    function pause() external;

    function unpause() external;

    function stopDoomsday() external;

    function destroyForDoomsday() external;

}
