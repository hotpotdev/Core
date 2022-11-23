// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

// openzeppelin
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "./SwapCurve.sol";
import "./HotpotMetadata.sol";
import "../interfaces/IHotpotFactory.sol";

abstract contract HotpotERC20Base is ERC20VotesUpgradeable, HotpotMetadata, SwapCurve, AccessControlUpgradeable {
    bool private _paused = true;
    bytes32 public constant FACTORY_ROLE = keccak256("FACTORY_ROLE");
    bytes32 public constant PROJECT_ADMIN_ROLE = keccak256("PROJECT_ADMIN_ROLE");

    address internal _projectTreasury;
    address internal _projectAdmin;
    IHotpotFactory internal _factory;
    bool internal _isSbt;

    uint256 private _maxDaoTokenSupply = 1e36;
    bool private _doomsday = false;

    modifier whenNotPaused() {
        require(!paused(), "Pausable: paused");
        _;
    }

    function getProjectAdminRole() external pure returns (bytes32 role) {
        return PROJECT_ADMIN_ROLE;
    }

    // 设置daoToken的铸造上限
    function cap() public view returns (uint256) {
        return _maxDaoTokenSupply;
    }

    function doomsday() public view returns (bool) {
        return _doomsday;
    }

    function getFactory() public view returns (address) {
        return address(_factory);
    }

    function getProjectAdmin() public view returns (address) {
        return _projectAdmin;
    }

    function getProjectTreasury() public view returns (address) {
        return _projectTreasury;
    }

    function setMetadata(string memory url) public onlyRole(PROJECT_ADMIN_ROLE) {
        _setMetadata(url);
    }

    function paused() public view returns (bool) {
        return _paused;
    }

    function pause() public onlyRole(FACTORY_ROLE) {
        _paused = true;
    }

    function unpause() public onlyRole(FACTORY_ROLE) {
        _paused = false;
    }

    function declareDoomsday() public onlyRole(FACTORY_ROLE) {
        if (!paused()) {
            _paused = true;
        }
        _declareDoomsday();
    }

    function setProjectAdmin(address newProjectAdmin) public onlyRole(PROJECT_ADMIN_ROLE) {
        require(newProjectAdmin != address(0), "Invalid Address");
        _grantRole(PROJECT_ADMIN_ROLE, newProjectAdmin);
        _revokeRole(PROJECT_ADMIN_ROLE, _projectAdmin);
        _projectAdmin = newProjectAdmin;
        emit LogProjectAdminChanged(newProjectAdmin);
    }

    function publishToken(address gov) public onlyRole(FACTORY_ROLE) {
        require(gov != address(0), "Invalid Address");
        _grantRole(PROJECT_ADMIN_ROLE, gov);
        _revokeRole(PROJECT_ADMIN_ROLE, _projectAdmin);
        _projectAdmin = gov;
        unpause();
        emit LogProjectAdminChanged(gov);
    }

    function setProjectTreasury(address newProjectTreasury) public onlyRole(PROJECT_ADMIN_ROLE) {
        require(newProjectTreasury != address(0), "Invalid Address");
        _projectTreasury = newProjectTreasury;
        emit LogProjectTreasuryChanged(newProjectTreasury);
    }

    function destroyForDoomsday() public onlyRole(PROJECT_ADMIN_ROLE) {
        _destroy();
    }

    function _setMintCap(uint256 upperlimit) internal {
        require(upperlimit >= totalSupply(), "Warning: Mint Cap must great or equl than current supply");
        _maxDaoTokenSupply = upperlimit;
    }

    function _initProject(address projectAdmin, address projectTreasury) internal {
        require(projectAdmin != address(0), "Invalid Admin Address");
        require(projectTreasury != address(0), "Invalid Treasury Address");
        _projectAdmin = projectAdmin;
        _projectTreasury = projectTreasury;
    }

    function _initFactory(address account) internal {
        require(account != address(0), "Invalid Treasury Address");
        _factory = IHotpotFactory(account);
    }

    function _declareDoomsday() internal {
        _doomsday = true;
        emit LogDeclareDoomsday(_msgSender());
    }

    function _destroy() internal {
        require(_doomsday, "Warning: You are not allowed to destroy under normal circumstances");
        emit LogDestroyed(_msgSender());
        selfdestruct(payable(_projectTreasury));
    }

    function isSbt() public view returns (bool) {
        return _isSbt;
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(!isSbt(), "SBT can not transfer");
        super._transfer(from, to, amount);
    }

    event LogDeclareDoomsday(address account);
    event LogDestroyed(address account);
    event LogProjectAdminChanged(address newAccount);
    event LogProjectTreasuryChanged(address newAccount);

    fallback() external {}
}
