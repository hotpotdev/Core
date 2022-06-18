// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IHotpotFactory.sol";
import "./interfaces/IHotpotToken.sol";
import "./ExpMixedToken.sol";
import "./LinearMixedToken.sol";
import "hardhat/console.sol";

interface IHotpotERC20 is IHotpotToken {
    function initialize(
        string memory name,
        string memory symbol,
        address projectAdmin,
        address projectTreasury,
        uint256 projectMintTax,
        uint256 projectBurnTax,
        bytes memory data
    ) external;
}

contract HotpotTokenFactory is IHotpotFactory, Initializable, AccessControl {
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN");

    mapping(string => address) private _implementsMap;
    mapping(uint256 => address) private tokens;
    mapping(address => string) private tokensType;
    mapping(address => uint256) private upgradeTimelock;
    mapping(address => bytes) private upgradeList;

    uint256 private tokensLength;

    address private _platformAdmin;
    address private _platformTreasury;
    ProxyAdmin private _proxyAdmin;

    uint256 private constant MAX_TAX_RATE_DENOMINATOR = 10000;
    uint256 private _platformMintTax;
    uint256 private _platformBurnTax;

    receive() external payable {
        (bool success, ) = _platformTreasury.call{value: msg.value}("");
        require(success, "platform transfer failed");
    }

    fallback() external payable {}

    function initialize(address platformAdmin, address platformTreasury) public initializer {
        _grantRole(PLATFORM_ADMIN_ROLE, platformAdmin);
        _platformAdmin = platformAdmin;
        _platformTreasury = platformTreasury;
        _platformMintTax = 100;
        _platformBurnTax = 100;
        _proxyAdmin = new ProxyAdmin();
    }

    function deployToken(
        string memory tokenType,
        string memory name,
        string memory symbol,
        address projectAdmin,
        address projectTreasury,
        uint256 projectMintTax,
        uint256 projectBurnTax,
        bytes calldata data
    ) public returns (address) {
        bytes memory call = abi.encodeWithSelector(
            IHotpotERC20.initialize.selector,
            name,
            symbol,
            projectAdmin,
            projectTreasury,
            projectMintTax,
            projectBurnTax,
            data
        );
        require(_implementsMap[tokenType] != address(0), "Deploy Failed: token type has no implement");
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            _implementsMap[tokenType],
            address(_proxyAdmin),
            call
        );
        uint256 tokenId = tokensLength;
        tokens[tokensLength] = address(proxy);
        tokensLength++;
        tokensType[address(proxy)] = tokenType;

        emit LogTokenDeployed(tokenType, tokenId, address(proxy));
        return address(proxy);
    }

    function setPlatformTaxRate(uint256 platformMintTax, uint256 platformBurnTax) public onlyRole(PLATFORM_ADMIN_ROLE) {
        require(100 >= platformMintTax && platformMintTax >= 0, "SetTax:Platform Mint Tax Rate must between 0% to 1%");
        require(100 >= platformBurnTax && platformBurnTax >= 0, "SetTax:Platform Burn Tax Rate must between 0% to 1%");
        require(platformMintTax < MAX_TAX_RATE_DENOMINATOR, "SetTax: Invalid number");
        require(platformBurnTax < MAX_TAX_RATE_DENOMINATOR, "SetTax: Invalid number");
        _platformMintTax = platformMintTax;
        _platformBurnTax = platformBurnTax;
        emit LogPlatformTaxChanged();
    }

    function getTaxRateOfPlatform() public view returns (uint256 platformMintTax, uint256 platformBurnTax) {
        return (_platformMintTax, _platformBurnTax);
    }

    function addImplement(string memory tokenType, address impl) public onlyRole(PLATFORM_ADMIN_ROLE) {
        require(impl != address(0), "invalid implement");
        _implementsMap[tokenType] = impl;
        emit LogTokenTypeImplAdded(tokenType, impl);
    }

    function getImplement(string memory tokenType) public view returns (address impl) {
        impl = _implementsMap[tokenType];
        require(impl != address(0), "no such implement");
    }

    function getTokensLength() public view returns (uint256 len) {
        len = tokensLength;
    }

    function getToken(uint256 index) public view returns (address addr) {
        addr = tokens[index];
        require(addr != address(0), "no such token");
    }

    function getPlatformAdmin() public view returns (address) {
        return _platformAdmin;
    }

    function getPlatformTreasury() public view returns (address) {
        return _platformTreasury;
    }

    function setPlatformAdmin(address newPlatformAdmin) public onlyRole(PLATFORM_ADMIN_ROLE) {
        require(newPlatformAdmin != address(0), "Invalid Address");
        _grantRole(PLATFORM_ADMIN_ROLE, newPlatformAdmin);
        _revokeRole(PLATFORM_ADMIN_ROLE, _platformAdmin);
        _platformAdmin = newPlatformAdmin;
        emit LogPlatformAdminChanged(newPlatformAdmin);
    }

    function setPlatformTreasury(address newPlatformTreasury) public onlyRole(PLATFORM_ADMIN_ROLE) {
        require(newPlatformTreasury != address(0), "Invalid Address");
        _platformTreasury = newPlatformTreasury;
        emit LogPlatformTreasuryChanged(newPlatformTreasury);
    }

    function declareDoomsday(address proxyAddress) external override onlyRole(PLATFORM_ADMIN_ROLE) {
        IHotpotERC20(proxyAddress).declareDoomsday();
    }

    function pause(address proxyAddress) external override onlyRole(PLATFORM_ADMIN_ROLE) {
        IHotpotERC20(proxyAddress).pause();
    }

    function unpause(address proxyAddress) external override onlyRole(PLATFORM_ADMIN_ROLE) {
        IHotpotERC20(proxyAddress).unpause();
    }

    function requestUpgrade(address proxyAddress, bytes calldata data) external onlyRole(PLATFORM_ADMIN_ROLE) {
        require(_implementsMap[tokensType[proxyAddress]] != address(0), "Upgrade Failed: Invalid Implement");
        upgradeTimelock[proxyAddress] = block.timestamp + 2 days;
        upgradeList[proxyAddress] = abi.encode(_implementsMap[tokensType[proxyAddress]], data);
        emit LogTokenUpgradeRequested(
            proxyAddress,
            upgradeTimelock[proxyAddress],
            _implementsMap[tokensType[proxyAddress]],
            msg.sender,
            data
        );
    }

    function rejectUpgrade(address proxyAddress, string calldata reason) external {
        bytes32 projectAdminRole = IHotpotERC20(proxyAddress).getProjectAdminRole();
        require(IHotpotERC20(proxyAddress).hasRole(projectAdminRole, msg.sender));
        require(upgradeTimelock[proxyAddress] != 0, "project have no upgrade");
        upgradeTimelock[proxyAddress] = 0;
        upgradeList[proxyAddress] = new bytes(0);
        emit LogTokenUpgradeRejected(proxyAddress, msg.sender, reason);
    }

    function upgradeTokenImplement(address proxyAddress) external payable override onlyRole(PLATFORM_ADMIN_ROLE) {
        require(
            upgradeTimelock[proxyAddress] != 0 && upgradeTimelock[proxyAddress] <= block.timestamp,
            "Upgrade Failed: timelock"
        );
        (address impl, bytes memory data) = abi.decode(upgradeList[proxyAddress], (address, bytes));
        upgradeTimelock[proxyAddress] = 0;
        upgradeList[proxyAddress] = new bytes(0);
        require(impl != address(0), "Upgrade Failed: Invalid Implement");
        _proxyAdmin.upgradeAndCall{value: msg.value}(TransparentUpgradeableProxy(payable(proxyAddress)), impl, data);
        emit LogTokenImplementUpgraded(proxyAddress, tokensType[proxyAddress], _implementsMap[tokensType[proxyAddress]]);
    }
}
