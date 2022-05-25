// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

// openzeppelin
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// diy
import "./SwapCurve.sol";
import "./HotpotMetadata.sol";


abstract contract HotpotERC20Base is ERC20Pausable, HotpotMetadata, SwapCurve, AccessControl {
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
    bytes32 public constant PROJECT_ROLE = keccak256("PROJECT_ROLE");
    bytes32 public constant PREMINT_ROLE = keccak256("PREMINT_ROLE");

    address public _treasury = 0x0000000000000000000000000000000000000000;
    address public _platform = 0x0000000000000000000000000000000000000000;

    uint private _mintCap = 1e36;
    bool private _premint = false;
    bool private _doomsday = false;

    function cap() public view returns(uint) {
        return _mintCap;
    }

    function premint() public view returns(bool) {
        return _premint;
    }

    function doomsday() public view returns(bool) {
        return _doomsday;
    }

    function platform() public view returns(address) {
        return _platform;
    }

    function treasury() public view returns(address) {
        return _treasury;
    }

    function setMetadata(string memory url) public onlyRole(PROJECT_ROLE){
        _setMetadata(url);
    }

    function normalizeMint() public onlyRole(PROJECT_ROLE) {
        _normalizeMint();
    }
    
    function pause() public onlyRole(PLATFORM_ROLE) {
        _pause();
    }
    
    function unpause() public onlyRole(PLATFORM_ROLE) {
        _unpause();
    }

    function declareDoomsday() public onlyRole(PLATFORM_ROLE) {
        if(!paused()) {
            _pause();
        }
        _declareDoomsday();
    }

    function destroyForDoomsday() public onlyRole(PROJECT_ROLE) {
        _destroy();
    }
    
    function _setMintCap(uint upperlimit) internal {
        require(upperlimit>=totalSupply(),'Warning: Mint Cap must great or equl than current supply');
        _mintCap = upperlimit;
    }

    function _initPremint() internal {
        _premint = true;
    }

    function _initTreasury(address account) internal {
        _treasury = account;
    }

    function _initPlatform(address account) internal {
        _platform = account;
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
        require(!_doomsday, 'Warning: You are not allowed to destroy under normal circumstances');
        emit Destroyed(_msgSender());
        selfdestruct(payable(_treasury));
    }

    event StopPremint(address account);
    event DeclareDoomsday(address account);
    event Destroyed(address account);
}