// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";

/**
 * @dev Interface of the hotpot swap
 */
interface IHotpotToken is IAccessControlUpgradeable {
    function initialize(
        address bondingCurveAddress,
        string memory name,
        string memory symbol,
        string memory metadata,
        address projectAdmin,
        address projectTreasury,
        uint256 projectMintTax,
        uint256 projectBurnTax,
        bool isSbt,
        address raisingTokenAddr,
        bytes memory parameters,
        address factory
    ) external;

    function setGov(address gov) external;

    function getProjectAdminRole() external pure returns (bytes32 role);

    function setMetadata(string memory url) external;

    function getMetadata() external view returns (string memory);

    function getTaxRateOfProject() external view returns (uint256 projectMintRate, uint256 projectBurnRate);

    function getTaxRateOfPlatform() external view returns (uint256 platformMintTax, uint256 platformBurnTax);

    function setProjectTaxRate(uint256 projectMintTax, uint256 projectBurnTax) external;

    function getFactory() external view returns (address);

    function getRaisingToken() external view returns (address);

    function getProjectAdmin() external view returns (address);

    function getProjectTreasury() external view returns (address);

    function setProjectAdmin(address newProjectAdmin) external;

    function setProjectTreasury(address newProjectTreasury) external;

    function price() external view returns (uint256);

    function mint(address to, uint payAmount, uint minReceive) external payable;

    function estimateMint(
        uint payAmount
    ) external view returns (uint receivedAmount, uint paidAmount, uint platformFee, uint projectFee);

    function estimateMintNeed(
        uint tokenAmountWant
    ) external view returns (uint receivedAmount, uint paidAmount, uint platformFee, uint projectFee);

    function burn(address to, uint payAmount, uint minReceive) external payable;

    function estimateBurn(
        uint tokenAmount
    ) external view returns (uint amountNeed, uint amountReturn, uint platformFee, uint projectFee);

    function pause() external;

    function unpause() external;

    function destroyForDoomsday() external;

    function declareDoomsday() external;
}
