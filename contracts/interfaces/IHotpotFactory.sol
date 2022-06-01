// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IHotpotFactory {
    function deployToken(
        string memory tokenType,
        string memory name,
        string memory symbol,
        address treasury,
        uint256 mintRate,
        uint256 burnRate,
        bool hasPremint,
        uint256 mintCap,
        bytes memory data
    ) external returns (address depoyed);

    function addImplement(string memory tokenType, address impl) external;

    function getImplement(string memory tokenType) external view returns (address impl);

    function getTokensLength() external view returns (uint256 len);

    function getToken(uint256 index) external view returns (address addr);

    function getPlatform() external view returns (address);

    function declareDoomsday(address proxyAddress) external;

    function pause(address proxyAddress) external;

    function unpause(address proxyAddress) external;

    function upgradeTokenImplement(address proxyAddress, bytes calldata data) external payable;

    event TokenDeployed(
        string tokenType,
        address deployedAddr,
        uint256 burnRate,
        uint256 mintRate,
        address treasury,
        bytes extraData,
        uint256 mintCap
    );

    event TokenImplementUpgraded(address proxyAddress, string tokenType, address implementAddr, bytes data);

    event TokenTypeImplAdded(string tokenType, address impl);
    
    event PlatformAdminChanged(address newAccount);
}
