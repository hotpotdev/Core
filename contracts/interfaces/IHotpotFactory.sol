// SPDX-License-Identifier: MIT

import "../libraries/GovernorLib.sol";

pragma solidity ^0.8.0;

interface IHotpotFactory {
    struct TokenInfo {
        string tokenType;
        string bondingCurveType;
        string name;
        string symbol;
        string metadata;
        address projectAdmin;
        address projectTreasury;
        uint256 projectMintTax;
        uint256 projectBurnTax;
        bool isSbt;
        address raisingTokenAddr;
        bytes data;
    }

    function deployToken(TokenInfo calldata token, uint256 mintfirstAmount) external payable;

    function createGovernorForToken(address proxyAddr, GovernorLib.GovInfo calldata token) external;

    function addBondingCurveImplement(address impl) external;

    function updateHotpotImplement(string calldata tokenType, address impl) external;

    function getHotpotImplement(string memory tokenType) external view returns (address impl);

    function getBondingCurveImplement(string calldata bondingCurveType) external view returns (address impl);

    function setPlatformTaxRate(uint256 platformMintTax, uint256 platformBurnTax) external;

    function getTaxRateOfPlatform() external view returns (uint256 platformMintTax, uint256 platformBurnTax);

    function getTokensLength() external view returns (uint256 len);

    function getToken(uint256 index) external view returns (address addr);

    function getPlatformAdmin() external view returns (address);

    function getPlatformTreasury() external view returns (address);

    function declareDoomsday(address proxyAddress) external;

    function pause(address proxyAddress) external;

    function unpause(address proxyAddress) external;

    function requestUpgrade(address proxyAddress, bytes calldata data) external;

    function rejectUpgrade(address proxyAddress, string calldata reason) external;

    function upgradeTokenImplement(address proxyAddress) external payable;

    event LogTokenDeployed(string tokenType, string bondingCurveType, uint256 tokenId, address deployedAddr);

    event LogTokenUpgradeRequested(
        address proxyAddress,
        uint256 timelock,
        address implementAddr,
        address requester,
        bytes data
    );
    event LogTokenUpgradeRejected(address proxyAddress, address rejecter, string reason);
    event LogTokenImplementUpgraded(address proxyAddress, string tokenType, address implementAddr);

    event LogTokenTypeImplAdded(string tokenType, address impl);

    event LogBondingCurveTypeImplAdded(string tokenType, address impl);

    event LogPlatformAdminChanged(address newAccount);

    event LogPlatformTreasuryChanged(address newAccount);

    event LogPlatformTaxChanged();
}
