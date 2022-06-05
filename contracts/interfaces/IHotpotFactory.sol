// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IHotpotFactory {
    function deployToken(
        string memory tokenType,
        string memory name,
        string memory symbol,
        address projectAdmin,
        address projectTreasury,
        uint256 projectMintTax,
        uint256 projectBurnTax,
        bytes memory data
    ) external returns (address depoyed);

    function addImplement(string memory tokenType, address impl) external;

    function getImplement(string memory tokenType) external view returns (address impl);

    function setPlatformTaxRate(uint256 platformMintTax, uint256 platformBurnTax) external;

    function getTaxRateOfPlatform() external view returns (uint256 platformMintTax, uint256 platformBurnTax);

    function getTokensLength() external view returns (uint256 len);

    function getToken(uint256 index) external view returns (address addr);

    function getPlatformAdmin() external view returns (address);
    
    function getPlatformTreasury() external view returns (address);

    function declareDoomsday(address proxyAddress) external;

    function pause(address proxyAddress) external;

    function unpause(address proxyAddress) external;

    function upgradeTokenImplement(address proxyAddress, bytes calldata data) external payable;

    event LogTokenDeployed(string tokenType,uint tokenId,address deployedAddr);

    event LogTokenImplementUpgraded(address proxyAddress, string tokenType, address implementAddr);

    event LogTokenTypeImplAdded(string tokenType, address impl);
    
    event LogPlatformAdminChanged(address newAccount);

    event LogPlatformTreasuryChanged(address newAccount);

    event LogPlatformTaxChanged();

}
