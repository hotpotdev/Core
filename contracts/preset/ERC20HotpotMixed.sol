// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

// openzeppelin
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// diy
import "../abstract/HotpotERC20Base.sol";
import "../interfaces/IHotpotSwap.sol";

abstract contract ERC20HotpotMixed is HotpotERC20Base, IHotpotSwap, ReentrancyGuard {
    uint256 internal constant MAX_TAX_RATE_DENOMINATOR = 10000;

    uint256 internal _projectMintTax = 0;
    uint256 internal _projectBurnTax = 0;

    function initialize(
        string memory name,
        string memory symbol,
        address projectAdmin,
        address projectTreasury,
        uint256 projectMintTax,
        uint256 projectBurnTax,
        address factory
    ) public initializer {
        __ERC20_init(name, symbol);
        _initProject(projectAdmin, projectTreasury);
        _initFactory(factory);
        _projectMintTax = MAX_TAX_RATE_DENOMINATOR;
        _projectBurnTax = MAX_TAX_RATE_DENOMINATOR;

        _setProjectTaxRate(projectMintTax, projectBurnTax);

        _setupRole(FACTORY_ROLE, factory);

        _setupRole(PROJECT_ADMIN_ROLE, _projectAdmin);
        _setupRole(PREMINT_ROLE, _projectAdmin);

        _setRoleAdmin(PREMINT_ROLE, PROJECT_ADMIN_ROLE);
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
        return totalSupply();
    }

    function mint(address to, uint256 minDaoTokenRecievedAmount) public payable whenNotPaused nonReentrant {
        require(to != address(0), "can not mint to address(0)");
        // minDaoTokenRecievedAmount是为了用户购买的时候，处理滑点，防止在极端情况获得远少于期望的代币
        if (premint()) {
            _checkRole(PREMINT_ROLE, _msgSender());
        }
        uint256 daoTokenAmount;
        uint256 nativeTokenPaidAmount = msg.value;

        (uint256 _platformMintTax, ) = _factory.getTaxRateOfPlatform();
        uint256 projectFee = (nativeTokenPaidAmount * _projectMintTax) / MAX_TAX_RATE_DENOMINATOR;
        uint256 platformFee = (nativeTokenPaidAmount * _platformMintTax) / MAX_TAX_RATE_DENOMINATOR;
        // 计算实际打入bonding curve合约的native token(e.g., eth/bnb)的数量
        uint256 nativeTokenPaidToBondingCurveAmount = nativeTokenPaidAmount - projectFee - platformFee;
        // Calculate the actual amount through Bonding Curve
        (daoTokenAmount, ) = _calculateMintAmountFromBondingCurve(nativeTokenPaidToBondingCurveAmount, _getCurrentSupply());
        require(daoTokenAmount > 1e9 && nativeTokenPaidToBondingCurveAmount > 1e9, "Mint: token amount is too low");
        require(_getCurrentSupply() + daoTokenAmount <= cap(), "Mint: exceed dao token max supply");
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
        // 把daoToken铸造给to用户
        _mint(to, daoTokenAmount);

        emit LogMint(to, daoTokenAmount, nativeTokenPaidAmount, platformFee, projectFee);
    }

    /**
     * @dev 前端估算mint的铸造
     */
    function estimateMint(uint256 nativeTokenPaidAmount)
        public
        view
        returns (
            uint256 daoTokenAmount,
            uint256,
            uint256 platformFee,
            uint256 projectFee
        )
    {
        (uint256 _platformMintTax, ) = _factory.getTaxRateOfPlatform();
        projectFee = (nativeTokenPaidAmount * _projectMintTax) / MAX_TAX_RATE_DENOMINATOR;
        platformFee = (nativeTokenPaidAmount * _platformMintTax) / MAX_TAX_RATE_DENOMINATOR;
        (daoTokenAmount, ) = _calculateMintAmountFromBondingCurve(
            nativeTokenPaidAmount - projectFee - platformFee,
            _getCurrentSupply()
        );
        return (daoTokenAmount, nativeTokenPaidAmount, platformFee, projectFee);
    }

    /**
     * @dev burn实现的是将 daoToken打入bonding curve销毁，bonding curve计算相应的以太坊，再扣除手续费后将eth兑出的功能
     */
    function burn(address to, uint256 daoTokenPaidAmount) public whenNotPaused nonReentrant {
        require(to != address(0), "can not burn to address(0)");
        // require(msg.value == 0, "Burn: dont need to attach ether");
        address from = _msgSender();
        uint256 nativeTokenWithdrawAmount;
        // Calculate the actual amount through Bonding Curve
        (, uint256 _platformBurnTax) = _factory.getTaxRateOfPlatform();
        (, nativeTokenWithdrawAmount) = _calculateBurnAmountFromBondingCurve(daoTokenPaidAmount, _getCurrentSupply());

        require(daoTokenPaidAmount > 1e9 && nativeTokenWithdrawAmount > 1e9, "Balance: token amount is too low");
        require(address(this).balance >= nativeTokenWithdrawAmount, "Balance: balance is not enough");

        uint256 projectFee = (nativeTokenWithdrawAmount * _projectBurnTax) / MAX_TAX_RATE_DENOMINATOR;
        uint256 platformFee = (nativeTokenWithdrawAmount * _platformBurnTax) / MAX_TAX_RATE_DENOMINATOR;
        uint256 nativeTokenPaybackAmount = nativeTokenWithdrawAmount - projectFee - platformFee;

        _burn(from, daoTokenPaidAmount);

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

        emit LogBurned(from, daoTokenPaidAmount, nativeTokenPaybackAmount, platformFee, projectFee);
    }

    function estimateBurn(uint256 daoTokenAmount)
        public
        view
        returns (
            uint256,
            uint256 nativeTokenAmount,
            uint256 platformFee,
            uint256 projectFee
        )
    {
        (, uint256 _platformBurnTax) = _factory.getTaxRateOfPlatform();
        (, nativeTokenAmount) = _calculateBurnAmountFromBondingCurve(daoTokenAmount, _getCurrentSupply());

        projectFee = (nativeTokenAmount * _projectBurnTax) / MAX_TAX_RATE_DENOMINATOR;
        platformFee = (nativeTokenAmount * _platformBurnTax) / MAX_TAX_RATE_DENOMINATOR;
        nativeTokenAmount = nativeTokenAmount - projectFee - platformFee;
        return (daoTokenAmount, nativeTokenAmount, platformFee, projectFee);
    }

    function price() public view returns (uint256) {
        return _price(_getCurrentSupply());
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IHotpotSwap).interfaceId || super.supportsInterface(interfaceId);
    }

    function _setProjectTaxRate(uint256 projectMintTax, uint256 projectBurnTax) internal {
        require(_projectMintTax >= projectMintTax, "SetTax:Project Mint Tax Rate must lower than before");
        require(_projectBurnTax >= projectBurnTax, "SetTax:Project Burn Tax Rate must lower than before");
        _projectMintTax = projectMintTax;
        _projectBurnTax = projectBurnTax;
        (uint256 _platformMintTax, uint256 _platformBurnTax) = _factory.getTaxRateOfPlatform();
        require(_projectMintTax + _platformMintTax < MAX_TAX_RATE_DENOMINATOR, "SetTax: Invalid number");
        require(_projectBurnTax + _platformBurnTax < MAX_TAX_RATE_DENOMINATOR, "SetTax: Invalid number");
        emit LogProjectTaxChanged();
    }

    event LogProjectTaxChanged();

    event LogMint(address to, uint256 daoTokenAmount, uint256 nativeTokenAmount, uint256 platformFee, uint256 projectFee);

    event LogBurned(address from, uint256 daoTokenAmount, uint256 nativeTokenAmount, uint256 platformFee, uint256 projectFee);
}
