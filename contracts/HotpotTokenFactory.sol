// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IHotpotFactory.sol";
import "./interfaces/IHotpotToken.sol";
import "hardhat/console.sol";
import "./preset/HotpotERC20Mixed.sol";
import "./interfaces/IBondingCurve.sol";
import "./governor/Governor.sol";

contract HotpotTokenFactory is IHotpotFactory, Initializable, AccessControl {
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN");

    mapping(string => address) private _implementsMap;
    mapping(uint256 => address) private tokens;
    mapping(address => string) private tokensType;
    mapping(address => uint256) private upgradeTimelock;
    mapping(address => bytes) private upgradeList;

    uint256 private tokensLength;

    address private _hotpotImplementAddr;
    address private _platformAdmin;
    address private _platformTreasury;
    ProxyAdmin private _proxyAdmin;

    uint256 private constant MAX_PLATFORM_TAX_RATE = 100;
    uint256 private _platformMintTax;
    uint256 private _platformBurnTax;

    receive() external payable {
        (bool success, ) = _platformTreasury.call{value: msg.value}("");
        require(success, "platform transfer failed");
    }

    fallback() external payable {}

    function initialize(address platformAdmin, address platformTreasury, address hotpotImplementAddr) public initializer {
        _grantRole(PLATFORM_ADMIN_ROLE, platformAdmin);
        _platformAdmin = platformAdmin;
        _platformTreasury = platformTreasury;
        _platformMintTax = 80;
        _platformBurnTax = 80;
        _hotpotImplementAddr = hotpotImplementAddr;
        _proxyAdmin = new ProxyAdmin();
    }

    function deployToken(TokenInfo calldata token) public payable {
        bytes memory call = abi.encodeWithSelector(
            HotpotERC20Mixed.initialize.selector,
            getBondingCurveImplement(token.tokenType),
            token.name,
            token.symbol,
            token.metadata,
            token.projectAdmin,
            token.projectTreasury,
            token.projectMintTax,
            token.projectBurnTax,
            token.mintCap,
            token.isSbt,
            token.data,
            address(this)
        );
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(_hotpotImplementAddr, address(_proxyAdmin), call);
        uint256 tokenId = tokensLength;
        tokens[tokensLength] = address(proxy);
        tokensLength++;
        tokensType[address(proxy)] = token.tokenType;
        if (msg.value > 0) {
            (uint256 minReceive, , , ) = IHotpotToken(address(proxy)).estimateMint(msg.value);
            IHotpotToken(address(proxy)).mint{value: msg.value}(msg.sender, minReceive);
        }
        emit LogTokenDeployed(token.tokenType, tokenId, address(proxy));
    }

    function createGovernorForToken(address proxyAddr, GovInfo calldata govInfo) public {
        bytes32 projectAdminRole = IHotpotToken(proxyAddr).getProjectAdminRole();
        require(IHotpotToken(proxyAddr).hasRole(projectAdminRole, msg.sender), "not project admin");
        Governor gov = new Governor(
            govInfo.strategyReference,
            govInfo.strategy,
            govInfo.votingPeriod,
            govInfo.votingDelay,
            govInfo.proposalThreshold,
            govInfo.quorumVotes,
            govInfo.timelockDelay
        );
        IHotpotToken(proxyAddr).setGov(address(gov));
        emit LogGovernorCreated(address(proxyAddr), address(gov));
    }

    function setPlatformTaxRate(uint256 platformMintTax, uint256 platformBurnTax) public onlyRole(PLATFORM_ADMIN_ROLE) {
        require(
            MAX_PLATFORM_TAX_RATE >= platformMintTax && platformMintTax >= 0,
            "SetTax:Platform Mint Tax Rate must between 0% to 1%"
        );
        require(
            MAX_PLATFORM_TAX_RATE >= platformBurnTax && platformBurnTax >= 0,
            "SetTax:Platform Burn Tax Rate must between 0% to 1%"
        );
        _platformMintTax = platformMintTax;
        _platformBurnTax = platformBurnTax;
        emit LogPlatformTaxChanged();
    }

    function getTaxRateOfPlatform() public view returns (uint256 platformMintTax, uint256 platformBurnTax) {
        return (_platformMintTax, _platformBurnTax);
    }

    function addBondingCurveImplement(address impl) public onlyRole(PLATFORM_ADMIN_ROLE) {
        require(impl != address(0), "invalid implement");
        string memory tokenType = IBondingCurve(impl).BondingCurveType();
        require(bytes(tokenType).length != bytes("").length, "bonding curve type error");
        require(_implementsMap[tokenType] == address(0), "this type already exist");
        _implementsMap[tokenType] = impl;
        emit LogTokenTypeImplAdded(tokenType, impl);
    }

    function getBondingCurveImplement(string calldata tokenType) public view returns (address impl) {
        impl = _implementsMap[tokenType];
        require(impl != address(0), "no such implement");
    }

    function updateHotpotImplement(address impl) public onlyRole(PLATFORM_ADMIN_ROLE) {
        _hotpotImplementAddr = impl;
    }

    function getHotpotImplement() external view returns (address impl) {
        require(_hotpotImplementAddr != address(0), "no implement");
        impl = _hotpotImplementAddr;
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
        IHotpotToken(proxyAddress).declareDoomsday();
    }

    function pause(address proxyAddress) external override onlyRole(PLATFORM_ADMIN_ROLE) {
        IHotpotToken(proxyAddress).pause();
    }

    function unpause(address proxyAddress) external override onlyRole(PLATFORM_ADMIN_ROLE) {
        IHotpotToken(proxyAddress).unpause();
    }

    function requestUpgrade(address proxyAddress, bytes calldata data) external onlyRole(PLATFORM_ADMIN_ROLE) {
        require(
            _hotpotImplementAddr != _proxyAdmin.getProxyImplementation(TransparentUpgradeableProxy(payable(proxyAddress))),
            "Upgrade Failed: Same Implement"
        );
        require(_hotpotImplementAddr != address(0), "Invalid Implement");
        upgradeTimelock[proxyAddress] = block.timestamp + 2 days;
        upgradeList[proxyAddress] = abi.encode(_hotpotImplementAddr, data);
        emit LogTokenUpgradeRequested(proxyAddress, upgradeTimelock[proxyAddress], _hotpotImplementAddr, msg.sender, data);
    }

    function rejectUpgrade(address proxyAddress, string calldata reason) external {
        bytes32 projectAdminRole = IHotpotToken(proxyAddress).getProjectAdminRole();
        require(IHotpotToken(proxyAddress).hasRole(projectAdminRole, msg.sender), "not project admin");
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
        _proxyAdmin.upgradeAndCall{value: msg.value}(TransparentUpgradeableProxy(payable(proxyAddress)), impl, data);
        emit LogTokenImplementUpgraded(proxyAddress, tokensType[proxyAddress], _implementsMap[tokensType[proxyAddress]]);
    }
}
