// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";

/**
 * @dev Interface of the hotpot swap
 */
interface IHotpotToken is IAccessControlUpgradeable {
    function getProjectAdminRole() external pure returns (bytes32 role);

    function setMetadata(string memory url) external;

    function getMetadata() external view returns (string memory);

    function getTaxRateOfProject() external view returns (uint256 projectMintRate, uint256 projectBurnRate);

    function getTaxRateOfPlatform() external view returns (uint256 platformMintTax, uint256 platformBurnTax);

    function setProjectTaxRate(uint256 projectMintTax, uint256 projectBurnTax) external;

    function platform() external view returns (address);

    function treasury() external view returns (address);

    function cap() external view returns (uint256 cap);

    function premint() external view returns (bool);

    function getFactory() external view returns (address);

    function getProjectAdmin() external view returns (address);

    function getProjectTreasury() external view returns (address);

    function setProjectAdmin(address newProjectAdmin) external;

    function setProjectTreasury(address newProjectTreasury) external;

    function normalizeMint() external;

    function price() external view returns (uint256);

    function mint(address to, uint256 minDaoTokenRecievedAmount) external payable;

    function estimateMint(uint256 nativeTokenPaidAmount)
        external
        view
        returns (
            uint256 daoTokenAmount,
            uint256,
            uint256 platformFee,
            uint256 projectFee
        );

    function burn(address to, uint256 daoTokenPaidAmount) external payable;

    function estimateBurn(uint256 daoTokenAmount)
        external
        view
        returns (
            uint256,
            uint256 nativeTokenAmount,
            uint256 platformFee,
            uint256 projectFee
        );

    function pause() external;

    function unpause() external;

    function destroyForDoomsday() external;

    function declareDoomsday() external;
}
