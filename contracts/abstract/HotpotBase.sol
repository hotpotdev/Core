// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

// openzeppelin
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "./SwapCurve.sol";
import "./HotpotMetadata.sol";
import "../interfaces/IHotpotFactory.sol";

abstract contract HotpotBase is HotpotMetadata, SwapCurve, AccessControlUpgradeable {
    bool private _paused = false;
    bytes32 public constant FACTORY_ROLE = keccak256("FACTORY_ROLE");
    bytes32 public constant PROJECT_ADMIN_ROLE = keccak256("PROJECT_ADMIN_ROLE");

    address internal _projectTreasury;
    address internal _projectAdmin;
    IHotpotFactory internal _factory;
    bool internal _isSbt;

    bool private _doomsday = false;

    modifier whenNotPaused() {
        require(!paused(), "Pausable: paused");
        _;
    }

    function getProjectAdminRole() external pure returns (bytes32 role) {
        return PROJECT_ADMIN_ROLE;
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
        emit Paused(_msgSender());
    }

    function unpause() public onlyRole(FACTORY_ROLE) {
        _paused = false;
        emit Unpaused(_msgSender());
    }

    function declareDoomsday() public onlyRole(FACTORY_ROLE) {
        if (!paused()) {
            _paused = true;
        }
        _declareDoomsday();
    }

    function setProjectAdmin(address newProjectAdmin) public onlyRole(PROJECT_ADMIN_ROLE) {
        require(newProjectAdmin != address(0), "Invalid Address");
        _revokeRole(PROJECT_ADMIN_ROLE, _projectAdmin);
        _grantRole(PROJECT_ADMIN_ROLE, newProjectAdmin);
        _projectAdmin = newProjectAdmin;
        emit LogProjectAdminChanged(newProjectAdmin);
    }

    function setGov(address gov) public onlyRole(FACTORY_ROLE) {
        require(gov != address(0), "Invalid Address");
        _revokeRole(PROJECT_ADMIN_ROLE, _projectAdmin);
        _grantRole(PROJECT_ADMIN_ROLE, gov);
        _projectAdmin = gov;
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

    event LogDeclareDoomsday(address account);
    event LogDestroyed(address account);
    event LogProjectAdminChanged(address newAccount);
    event LogProjectTreasuryChanged(address newAccount);
    event Paused(address account);
    event Unpaused(address account);

    fallback() external {}
}
