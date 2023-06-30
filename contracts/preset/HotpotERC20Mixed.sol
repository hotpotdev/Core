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
        address raisingTokenAddr,
        bytes memory parameters,
        address factory
    ) public override initializer {
        __ERC20_init(name, symbol);
        _changeCoinMaker(bondingCurveAddress);
        _initProject(projectAdmin, projectTreasury);
        _initFactory(factory);
        _setMetadata(metadata);
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
        address[] memory hooks = getHooks();
        for (uint256 i = 0; i < hooks.length; i++) {
            require(IHook(hooks[i]).beforeMintHook(address(0), account, amount));
        }
        _mint(account, amount);

        for (uint256 i = 0; i < hooks.length; i++) {
            require(IHook(hooks[i]).afterMintHook(address(0), account, amount));
        }
    }

    function _burnInternal(address account, uint256 amount) internal virtual override {
        address[] memory hooks = getHooks();
        for (uint256 i = 0; i < hooks.length; i++) {
            require(IHook(hooks[i]).beforeBurnHook(account, address(0), amount));
        }
        _burn(account, amount);

        for (uint256 i = 0; i < hooks.length; i++) {
            require(IHook(hooks[i]).afterBurnHook(account, address(0), amount));
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "ERC20Pausable: token transfer while paused");
        address[] memory hooks = getHooks();
        for (uint256 i = 0; i < hooks.length; i++) {
            require(IHook(hooks[i]).beforeTransferHook(from, to, amount));
        }
    }

    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._afterTokenTransfer(from, to, amount);
        address[] memory hooks = getHooks();
        for (uint256 i = 0; i < hooks.length; i++) {
            require(IHook(hooks[i]).afterTransferHook(from, to, amount));
        }
    }
}
