// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IHotpotFactory.sol";
import "./interfaces/IHotpot.sol";
import "./ExpMixedToken.sol";
import "./LinearMixedToken.sol";

interface IHotpotERC20 is IHotpotToken {
    function initialize(
        string memory name,
        string memory symbol,
        address treasury,
        uint256 mintRate,
        uint256 burnRate,
        bool hasPreMint,
        uint256 mintCap,
        bytes memory data
    ) external;
}

contract HotpotTokenFactory is IHotpotFactory, Initializable, AccessControl {
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN");
    bytes32 public constant PLATFORM_MANAGER_ROLE = keccak256("PLATFORM_MANAGER");

    mapping(string => address) private _implementsMap;
    mapping(uint256 => address) private tokens;
    mapping(address => string) private tokensType;
 
    uint256 private tokensLength;

    address private _platform;   
    ProxyAdmin private _proxyAdmin;

    receive() external payable {
        // console.log(msg.value);
        (bool success, ) = _platform.call{value: msg.value}("");
        require(success, "Transfer: charge platform gas failed");
    }

    fallback() external payable {}

    function initialize(address platform) public initializer {
        _setRoleAdmin(PLATFORM_MANAGER_ROLE, PLATFORM_ADMIN_ROLE);
        _grantRole(PLATFORM_ADMIN_ROLE, platform);
        _grantRole(PLATFORM_MANAGER_ROLE, platform);
        _platform = platform;
        _proxyAdmin = new ProxyAdmin();
    }

    function deployToken(
        string memory tokenType,
        string memory name,
        string memory symbol,
        address treasury,
        uint256 mintRate,
        uint256 burnRate,
        bool hasPreMint,
        uint256 mintCap,
        bytes calldata data
    ) public returns (address) {
        bytes memory call = abi.encodeWithSelector(
            IHotpotERC20.initialize.selector,
            name,
            symbol,
            treasury,
            mintRate,
            burnRate,
            hasPreMint,
            mintCap,
            data
        );
        require(_implementsMap[tokenType] != address(0), "Deploy Failed: token type has no implement");
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            _implementsMap[tokenType],
            address(_proxyAdmin),
            call
        );
        tokens[tokensLength] = address(proxy);
        tokensLength++;
        tokensType[address(proxy)] = tokenType;

        emit TokenDeployed(tokenType, address(proxy), burnRate, mintRate, treasury, data, mintCap);
        return address(proxy);
    }

    function addImplement(string memory tokenType, address impl) public onlyRole(PLATFORM_MANAGER_ROLE) {
        _implementsMap[tokenType] = impl;
        emit TokenTypeImplAdded(tokenType, impl);
    }

    function getImplement(string memory tokenType) public view returns (address impl) {
        impl = _implementsMap[tokenType];
    }

    function getTokensLength() public view returns (uint256 len) {
        len = tokensLength;
    }

    function getToken(uint256 index) public view returns (address addr) {
        addr = tokens[index];
    }

    function getPlatform() public view returns (address) {
        return _platform;
    }

    function setPlatform(address newAdmin) public onlyRole(PLATFORM_ADMIN_ROLE) {
        require(newAdmin != address(0), "Invalid Address");
        _grantRole(PLATFORM_ADMIN_ROLE, newAdmin);
        _revokeRole(PLATFORM_ADMIN_ROLE, _platform);
        _platform = newAdmin;
        emit PlatformAdminChanged(newAdmin);
    }

    function declareDoomsday(address proxyAddress) external override onlyRole(PLATFORM_MANAGER_ROLE) {
        IHotpotERC20(proxyAddress).declareDoomsday();
    }

    function pause(address proxyAddress) external override onlyRole(PLATFORM_MANAGER_ROLE) {
        IHotpotERC20(proxyAddress).pause();
    }

    function unpause(address proxyAddress) external override onlyRole(PLATFORM_MANAGER_ROLE) {
        IHotpotERC20(proxyAddress).unpause();
    }

    function upgradeTokenImplement(address proxyAddress, bytes calldata data) external payable override {
        require(msg.sender == _platform, "Upgrade Failed: Permission Not Allowed");
        _proxyAdmin.upgradeAndCall{value: msg.value}(
            TransparentUpgradeableProxy(payable(proxyAddress)),
            _implementsMap[tokensType[proxyAddress]],
            data
        );
        emit TokenImplementUpgraded(proxyAddress, tokensType[proxyAddress], _implementsMap[tokensType[proxyAddress]], data);
    }
}
