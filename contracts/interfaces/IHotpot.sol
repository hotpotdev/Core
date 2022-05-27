// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the hotpot swap
 */
interface IHotpotToken {
    function setMetadata(string memory url) external;

    function getMetadata() external view returns (string memory);

    function getTaxRate()
        external
        view
        returns (
            uint256 _projectMintRate,
            uint256 projectBurnRate,
            uint256 platformMintRate,
            uint256 platformBurnRate
        );

    function platform() external view returns (address);

    function treasury() external view returns (address);

    function cap() external view returns (uint256 cap);

    function premint() external view returns (bool);

    function normalizeMint() external;

    function price() external view returns (uint256);

    function mint(address to, uint256) external payable;

    function estimateMint(uint256)
        external
        view
        returns (
            uint256 dx,
            uint256 dy,
            uint256 gasMint
        );

    function burn(address to, uint256) external payable;

    function estimateBurn(uint256)
        external
        view
        returns (
            uint256 dx,
            uint256 dy,
            uint256 gasBurn
        );

    function pause() external;

    function unpause() external;

    function destroyForDoomsday() external;

    function declareDoomsday() external;
}
