// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

// openzeppelin
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// diy
import "../abstract/HotpotBase.sol";

contract HotpotERC20Mixed is HotpotBase, ERC20VotesUpgradeable {
    function initialize(
        address bondingCurveAddress,
        string memory name,
        string memory symbol,
        string memory metadata,
        address projectAdmin,
        address projectTreasury,
        uint256 projectMintTax,
        uint256 projectBurnTax,
        bool isSbt,
        address raisingTokenAddr,
        bytes memory parameters,
        address factory
    ) public override initializer {
        __ERC20_init(name, symbol);
        _changeCoinMaker(bondingCurveAddress);
        _initProject(projectAdmin, projectTreasury);
        _initFactory(factory);
        _setMetadata(metadata);
        _isSbt = isSbt;
        _bondingCurveParameters = parameters;
        _raisingToken = raisingTokenAddr;
        _setProjectTaxRate(projectMintTax, projectBurnTax);

        _setupRole(FACTORY_ROLE, factory);

        _setupRole(PROJECT_ADMIN_ROLE, projectAdmin);
    }

    function _getCurrentSupply() internal view override returns (uint256) {
        return totalSupply();
    }

    function _mintInternal(address account, uint256 amount) internal virtual override {
        _mint(account, amount);
    }

    function _burnInternal(address account, uint256 amount) internal virtual override {
        _burn(account, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "ERC20Pausable: token transfer while paused");
    }
}
