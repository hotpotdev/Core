// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

// openzeppelin
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721VotesUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
// diy
import "../abstract/HotpotBase.sol";
import "hardhat/console.sol";

contract HotpotERC721Mixed is HotpotBase, ERC721VotesUpgradeable {
    CountersUpgradeable.Counter private _counter;

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
        __ERC721_init(name, symbol);
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
        return _getTotalSupply();
    }

    function totalSupply() public view returns (uint256) {
        return _getCurrentSupply();
    }

    function _calculateMintAmountFromBondingCurve(
        uint256 _tokens,
        uint256 _totalSupply
    ) internal view virtual override returns (uint256, uint256) {
        (uint x, uint y) = _coinMaker.calculateMintAmountFromBondingCurve(
            _tokens,
            _totalSupply * 1e18,
            _bondingCurveParameters
        );
        return (x / 1e18, y);
    }

    function _calculateBurnAmountFromBondingCurve(
        uint256 _tokens,
        uint256 _totalSupply
    ) internal view virtual override returns (uint256, uint256) {
        (uint x, uint y) = _coinMaker.calculateBurnAmountFromBondingCurve(
            (_tokens >= _getCurrentSupply() ? _tokens : 1) * 1e18,
            _totalSupply * 1e18,
            _bondingCurveParameters
        );
        return (x / 1e18, y);
    }

    function _mintInternal(address account, uint256 amount) internal virtual override {
        while (amount > 0) {
            uint256 tokenId = CountersUpgradeable.current(_counter);
            CountersUpgradeable.increment(_counter);
            _mint(account, tokenId);
            amount--;
        }
    }

    function _afterMint(address account) internal view override {
        if (isSbt()) {
            require(balanceOf(account) < 2, "can not have more than 1 sbt");
        }
    }

    function _burnInternal(address, uint256 amount) internal virtual override {
        _burn(amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 /* firstTokenId */,
        uint256 amount
    ) internal virtual override {
        if (from != address(0) && to != address(0) && isSbt()) {
            revert("sbt can not transfer");
        }
        require(!paused(), "ERC20Pausable: token transfer while paused");
        super._beforeTokenTransfer(from, to, 0, amount);
    }

    function _baseURI() internal view override returns (string memory) {
        return getMetadata();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControlUpgradeable, ERC721Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
