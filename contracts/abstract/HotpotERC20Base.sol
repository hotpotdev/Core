// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

// openzeppelin
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";


// diy
import "./SwapCurve.sol";
import "./HotpotMetadata.sol";

abstract contract HotpotERC20Base is
    ERC20PausableUpgradeable,
    HotpotMetadata,
    SwapCurve,
    AccessControlUpgradeable
{
    bytes32 public constant FACTORY_ROLE = keccak256("FACTORY_ROLE");
    
    bytes32 public constant PROJECT_ADMIN_ROLE = keccak256("PROJECT_ADMIN_ROLE");
    bytes32 public constant PROJECT_MANAGER_ROLE = keccak256("PROJECT_MANAGER_ROLE");
    bytes32 public constant PREMINT_ROLE = keccak256("PREMINT_ROLE");

    address internal _treasury = 0x0000000000000000000000000000000000000000;
    address internal _factory = 0x0000000000000000000000000000000000000000;

    uint256 private _mintCap = 1e36;
    bool private _premint = false;
    bool private _doomsday = false;

    function cap() public view returns (uint256) {
        return _mintCap;
    }

    function premint() public view returns (bool) {
        return _premint;
    }

    function doomsday() public view returns (bool) {
        return _doomsday;
    }

    function factory() public view returns (address) {
        return _factory;
    }

    function treasury() public view returns (address) {
        return _treasury;
    }

    function setMetadata(string memory url) public onlyRole(PROJECT_MANAGER_ROLE) {
        _setMetadata(url);
    }

    function normalizeMint() public onlyRole(PROJECT_MANAGER_ROLE) {
        _normalizeMint();
    }
    
    function pause() public onlyRole(FACTORY_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(FACTORY_ROLE) {
        _unpause();
    }

    function declareDoomsday() public onlyRole(FACTORY_ROLE) {
        if (!paused()) {
            _pause();
        }
        _declareDoomsday();
    }
    
    function setTreasury(address newAdmin) public onlyRole(PROJECT_ADMIN_ROLE) {
        require(newAdmin != address(0), "Invalid Address");
        _grantRole(PROJECT_ADMIN_ROLE, newAdmin);
        _revokeRole(PROJECT_ADMIN_ROLE, _treasury);
        _treasury = newAdmin;
        emit TreasuryAdminChanged(newAdmin);
    }

    function destroyForDoomsday() public onlyRole(PROJECT_ADMIN_ROLE) {
        _destroy();
    }

    function _setMintCap(uint256 upperlimit) internal {
        require(
            upperlimit >= totalSupply(),
            "Warning: Mint Cap must great or equl than current supply"
        );
        _mintCap = upperlimit;
    }

    function _initPremint(bool pre) internal {
        _premint = pre;
    }

    function _initTreasury(address account) internal {
        require(account != address(0), "Invalid Treasury Address");
        _treasury = account;
    }

    function _initFactory(address account) internal {
        require(account != address(0), "Invalid Treasury Address");
        _factory = account;
    }

    function _normalizeMint() internal {
        _premint = false;
        emit StopPremint(_msgSender());
    }

    function _declareDoomsday() internal {
        _doomsday = true;
        emit DeclareDoomsday(_msgSender());
    }

    function _destroy() internal {
        require(
            _doomsday,
            "Warning: You are not allowed to destroy under normal circumstances"
        );
        emit Destroyed(_msgSender());
        selfdestruct(payable(_treasury));
    }

    event StopPremint(address account);
    event DeclareDoomsday(address account);
    event Destroyed(address account);
    event TreasuryAdminChanged(address newAccount);
}
