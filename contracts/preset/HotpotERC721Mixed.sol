// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

// openzeppelin
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721VotesUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// diy
import "../abstract/HotpotBase.sol";
import "../interfaces/IHotpotSwap.sol";

contract HotpotERC721Mixed is HotpotBase, ERC721VotesUpgradeable, IHotpotSwap, ReentrancyGuard {
    uint256 internal constant MAX_TAX_RATE_DENOMINATOR = 10000;
    uint256 internal constant MAX_PROJECT_TAX_RATE = 2000;
    uint256 internal _projectMintTax = 0;
    uint256 internal _projectBurnTax = 0;
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
        bytes memory parameters,
        address factory
    ) public initializer {
        __ERC721_init(name, symbol);
        _changeCoinMaker(bondingCurveAddress);
        _initProject(projectAdmin, projectTreasury);
        _initFactory(factory);
        _setMetadata(metadata);
        _isSbt = isSbt;
        _bondingCurveParameters = parameters;
        _setProjectTaxRate(projectMintTax, projectBurnTax);

        _setupRole(FACTORY_ROLE, factory);

        _setupRole(PROJECT_ADMIN_ROLE, projectAdmin);
    }

    function setProjectTaxRate(uint256 projectMintTax, uint256 projectBurnTax) public onlyRole(PROJECT_ADMIN_ROLE) {
        _setProjectTaxRate(projectMintTax, projectBurnTax);
    }

    function getTaxRateOfProject() public view returns (uint256 projectMintTax, uint256 projectBurnTax) {
        return (_projectMintTax, _projectBurnTax);
    }

    function getTaxRateOfPlatform() public view returns (uint256 platformMintTax, uint256 platformBurnTax) {
        return _factory.getTaxRateOfPlatform();
    }

    //  daoToken 会通过bonding curve铸造销毁所以totalSupply会动态变化
    function _getCurrentSupply() internal view returns (uint256) {
        return _getTotalSupply();
    }

    function totalSupply() public view returns (uint256) {
        return _getCurrentSupply();
    }

    function mint(address to, uint256 minDaoTokenRecievedAmount) public payable whenNotPaused nonReentrant returns (uint256) {
        require(to != address(0), "can not mint to address(0)");
        // minDaoTokenRecievedAmount是为了用户购买的时候，处理滑点，防止在极端情况获得远少于期望的代币
        uint256 daoTokenAmount;
        uint256 nativeTokenPaidAmount = msg.value;
        (uint256 _platformMintTax, ) = _factory.getTaxRateOfPlatform();
        uint256 projectFee = (nativeTokenPaidAmount * _projectMintTax) / MAX_TAX_RATE_DENOMINATOR;
        uint256 platformFee = (nativeTokenPaidAmount * _platformMintTax) / MAX_TAX_RATE_DENOMINATOR;
        // 计算实际打入bonding curve合约的native token(e.g., eth/bnb)的数量
        uint256 nativeTokenPaidToBondingCurveAmount = nativeTokenPaidAmount - projectFee - platformFee;
        // Calculate the actual amount through Bonding Curve
        (daoTokenAmount, ) = _calculateMintAmountFromBondingCurve(
            nativeTokenPaidToBondingCurveAmount,
            _getCurrentSupply() * 1e18
        );
        daoTokenAmount /= 1e18;
        require(daoTokenAmount > 0 && nativeTokenPaidToBondingCurveAmount > 1e9, "Mint: token amount is too low");
        // require(_getCurrentSupply() + daoTokenAmount <= cap(), "Mint: exceed dao token max supply");//disable mintCap temporarily
        // 用户/前端会要求最少获得多少daoToken，交易繁忙时如果实际可获得的少于期望的daoToken数量，则revert
        require(daoTokenAmount >= minDaoTokenRecievedAmount, "Mint: mint amount less than minimal expect recieved");

        {
            (bool success, ) = _factory.getPlatformTreasury().call{value: platformFee}("");
            // (bool success, ) = _factory.call{value: platformFee}("");
            require(success, "Transfer: charge factory gas failed");
        }
        {
            (bool success, ) = _projectTreasury.call{value: projectFee}("");
            require(success, "Transfer: charge project gas failed");
        }
        emit LogMint(to, daoTokenAmount, nativeTokenPaidAmount, platformFee, projectFee);
        // 把daoNFT铸造给to用户
        while (daoTokenAmount > 0) {
            uint256 tokenId = CountersUpgradeable.current(_counter);
            CountersUpgradeable.increment(_counter);
            _mint(to, tokenId);
            daoTokenAmount--;
        }
        if (isSbt()) {
            require(balanceOf(to) < 2, "can not have more than 1 sbt");
        }
        return daoTokenAmount;
    }

    /**
     * @dev 前端估算mint的铸造
     */
    function estimateMint(
        uint256 nativeTokenPaidAmount
    ) public view returns (uint256 daoTokenAmount, uint256, uint256 platformFee, uint256 projectFee) {
        (uint256 _platformMintTax, ) = _factory.getTaxRateOfPlatform();
        projectFee = (nativeTokenPaidAmount * _projectMintTax) / MAX_TAX_RATE_DENOMINATOR;
        platformFee = (nativeTokenPaidAmount * _platformMintTax) / MAX_TAX_RATE_DENOMINATOR;
        (daoTokenAmount, ) = _calculateMintAmountFromBondingCurve(
            nativeTokenPaidAmount - projectFee - platformFee,
            _getCurrentSupply() * 1e18
        );
        return (daoTokenAmount / 1e18, nativeTokenPaidAmount, platformFee, projectFee);
    }

    function estimateMintNeed(
        uint tokenAmountWant
    ) external view returns (uint daoTokenAmount, uint nativeTokenPaidAmount, uint platformFee, uint projectFee) {
        (uint256 _platformMintTax, ) = _factory.getTaxRateOfPlatform();
        (daoTokenAmount, nativeTokenPaidAmount) = _calculateBurnAmountFromBondingCurve(
            tokenAmountWant * 1e18,
            (_getCurrentSupply() + tokenAmountWant) * 1e18
        );
        nativeTokenPaidAmount *= MAX_TAX_RATE_DENOMINATOR;
        nativeTokenPaidAmount /= (MAX_TAX_RATE_DENOMINATOR - _projectMintTax - _platformMintTax);
        projectFee = (nativeTokenPaidAmount * _projectMintTax) / MAX_TAX_RATE_DENOMINATOR;
        platformFee = (nativeTokenPaidAmount * _platformMintTax) / MAX_TAX_RATE_DENOMINATOR;
        return (daoTokenAmount / 1e18, nativeTokenPaidAmount, platformFee, projectFee);
    }

    /**
     * @dev burn实现的是将 daoToken打入bonding curve销毁，bonding curve计算相应的以太坊，再扣除手续费后将eth兑出的功能
     */
    function burn(
        address to,
        uint256 tokenId,
        uint256 minNativeTokenRecievedAmount
    ) public whenNotPaused nonReentrant returns (uint256) {
        require(ownerOf(tokenId) == msg.sender, "you do not have this nft");
        require(to != address(0), "can not burn to address(0)");
        // require(msg.value == 0, "Burn: dont need to attach ether");
        address from = _msgSender();
        uint256 nativeTokenWithdrawAmount;
        // Calculate the actual amount through Bonding Curve
        (, uint256 _platformBurnTax) = _factory.getTaxRateOfPlatform();
        (, nativeTokenWithdrawAmount) = _calculateBurnAmountFromBondingCurve(1 * 1e18, _getCurrentSupply() * 1e18);

        require(nativeTokenWithdrawAmount > 1e9, "Balance: token amount is too low");
        require(address(this).balance >= nativeTokenWithdrawAmount, "Balance: balance is not enough");

        uint256 projectFee = (nativeTokenWithdrawAmount * _projectBurnTax) / MAX_TAX_RATE_DENOMINATOR;
        uint256 platformFee = (nativeTokenWithdrawAmount * _platformBurnTax) / MAX_TAX_RATE_DENOMINATOR;
        uint256 nativeTokenPaybackAmount = nativeTokenWithdrawAmount - projectFee - platformFee;
        require(
            nativeTokenPaybackAmount >= minNativeTokenRecievedAmount,
            "Burn: payback amount less than minimal expect recieved"
        );
        _burn(tokenId);
        emit LogBurned(from, 1, nativeTokenPaybackAmount, platformFee, projectFee);

        {
            (bool success, ) = _factory.getPlatformTreasury().call{value: platformFee}("");
            require(success, "Transfer: charge platform fee failed");
        }
        {
            (bool success, ) = _projectTreasury.call{value: projectFee}("");
            require(success, "Transfer: charge project fee failed");
        }
        {
            if (nativeTokenPaybackAmount > 0) {
                (bool success, ) = to.call{value: nativeTokenPaybackAmount}("");
                require(success, "Transfer: pay back eth failed");
            }
        }

        return nativeTokenPaybackAmount;
    }

    function estimateBurn(
        uint256 daoTokenAmount
    ) public view returns (uint256, uint256 nativeTokenAmount, uint256 platformFee, uint256 projectFee) {
        (, uint256 _platformBurnTax) = _factory.getTaxRateOfPlatform();
        (, nativeTokenAmount) = _calculateBurnAmountFromBondingCurve(daoTokenAmount * 1e18, _getCurrentSupply() * 1e18);
        projectFee = (nativeTokenAmount * _projectBurnTax) / MAX_TAX_RATE_DENOMINATOR;
        platformFee = (nativeTokenAmount * _platformBurnTax) / MAX_TAX_RATE_DENOMINATOR;
        nativeTokenAmount = nativeTokenAmount - projectFee - platformFee;
        return (daoTokenAmount, nativeTokenAmount, platformFee, projectFee);
    }

    function price() public view returns (uint256) {
        return _price(_getCurrentSupply() * 1e18);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControlUpgradeable, ERC721Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _setProjectTaxRate(uint256 projectMintTax, uint256 projectBurnTax) internal {
        require(
            (MAX_PROJECT_TAX_RATE >= projectMintTax && projectMintTax >= 0),
            "SetTax:Project Mint Tax Rate must lower than before or between 0% to 20%"
        );
        require(
            (MAX_PROJECT_TAX_RATE >= projectBurnTax && projectBurnTax >= 0),
            "SetTax:Project Burn Tax Rate must lower than before or between 0% to 20%"
        );
        _projectMintTax = projectMintTax;
        _projectBurnTax = projectBurnTax;
        (uint256 _platformMintTax, uint256 _platformBurnTax) = _factory.getTaxRateOfPlatform();
        require(_projectMintTax + _platformMintTax < MAX_TAX_RATE_DENOMINATOR, "SetTax: Invalid number");
        require(_projectBurnTax + _platformBurnTax < MAX_TAX_RATE_DENOMINATOR, "SetTax: Invalid number");
        emit LogProjectTaxChanged();
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

    event LogProjectTaxChanged();

    event LogMint(address to, uint256 daoTokenAmount, uint256 nativeTokenAmount, uint256 platformFee, uint256 projectFee);

    event LogBurned(address from, uint256 daoTokenAmount, uint256 nativeTokenAmount, uint256 platformFee, uint256 projectFee);
}
