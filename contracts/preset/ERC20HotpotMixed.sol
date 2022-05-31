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
    uint256 internal constant MAX_GAS_RATE_DENOMINATOR = 10000;
    uint256 internal constant _platformMintFee = 100;
    uint256 internal constant _platformBurnFee = 100;

    uint256 internal _treasuryMintFee = 100;
    uint256 internal _treasuryBurnFee = 100;

    function initialize(
        string memory name,
        string memory symbol,
        address treasury,
        uint256 mintRate,
        uint256 burnRate,
        address factory,
        bool hasPreMint,
        uint256 mintCap
    ) public initializer {
        __ERC20_init(name, symbol);
        _initTreasury(treasury);
        _initFactory(factory);

        _setTaxRate(mintRate, burnRate);

        _setupRole(FACTORY_ROLE, factory);

        _setupRole(PROJECT_ADMIN_ROLE, treasury);
        _setupRole(PROJECT_MANAGER_ROLE, treasury);
        _setupRole(PREMINT_ROLE, treasury);

        _setRoleAdmin(PREMINT_ROLE, PROJECT_ADMIN_ROLE);
        _setRoleAdmin(PROJECT_MANAGER_ROLE, PROJECT_ADMIN_ROLE);
        
        _initPremint(hasPreMint);
        _setMintCap(mintCap);
    }

    function _setTaxRate(uint256 mintRate, uint256 burnRate) internal {
        _treasuryMintFee = mintRate;
        _treasuryBurnFee = burnRate;
        require(_treasuryMintFee < MAX_GAS_RATE_DENOMINATOR, "SetTax: Invalid number");
        require(_treasuryMintFee + _treasuryMintFee < MAX_GAS_RATE_DENOMINATOR, "SetTax: Invalid number");
    }

    function getTaxRate()
        public
        view
        returns (
            uint256 _projectMintRate,
            uint256 projectBurnRate,
            uint256 platformMintRate,
            uint256 platformBurnRate
        )
    {
        return (_treasuryMintFee, _treasuryBurnFee, _projectMintRate, projectBurnRate);
    }

    function mint(address to, uint256 minimalErc20Token) public payable whenNotPaused nonReentrant {
        if (premint()) {
            _checkRole(PREMINT_ROLE, _msgSender());
        }
        uint256 dx;
        uint256 dy = msg.value;
        // TODO abi Compatibility issues
        require(1e9 <= dy, "Mint: value is too low");
        uint256 projectFee = (dy * _treasuryMintFee) / MAX_GAS_RATE_DENOMINATOR;
        uint256 platformFee = (dy * _platformMintFee) / MAX_GAS_RATE_DENOMINATOR;
        uint256 leftNative = dy - projectFee - platformFee;
        // Calculate the actual amount through Bonding Curve
        (dx, dy) = _mining(leftNative, totalSupply());
        require(dx > 1e9 && dy > 1e9, "Mint: token amount is too low");
        require(totalSupply() + dx <= cap(), "Mint: exceed upper limit");
        require(dx >= minimalErc20Token, "Mint: mint amount less than minimal expect");
        _mint(to, dx);

        {
            (bool success, ) = _factory.call{value: platformFee}("");
            require(success, "Transfer: charge factory gas failed");
        }
        {
            (bool success, ) = _treasury.call{value: projectFee}("");
            require(success, "Transfer: charge project gas failed");
        }

        emit Mined(to, dx, dy, platformFee, projectFee);
    }

    /**
     * @dev testMint
     */
    function estimateMint(uint256 nativeTokens)
        public
        view
        returns (
            uint256 dx,
            uint256 dy,
            uint256 gasMint
        )
    {
        gasMint = (nativeTokens * _treasuryMintFee) / MAX_GAS_RATE_DENOMINATOR;
        gasMint = gasMint + (nativeTokens * _platformMintFee) / MAX_GAS_RATE_DENOMINATOR;
        (dx, dy) = _mining(nativeTokens - gasMint, totalSupply());
        return (dx, dy, gasMint);
    }

    /**
     * @dev burn
     */
    function burn(address to, uint256 erc20Tokens) public whenNotPaused nonReentrant {
        // require(msg.value == 0, "Burn: dont need to attach ether");
        address from = _msgSender();
        uint256 dx = erc20Tokens;
        uint256 dy;
        // Calculate the actual amount through Bonding Curve
        (dx, dy) = _burning(erc20Tokens, totalSupply());
        require(dx > 1e9 && dy > 1e9, "Balance: token amount is too low");

        uint256 projectFee = (dy * _treasuryBurnFee) / MAX_GAS_RATE_DENOMINATOR;
        uint256 platformFee = (dy * _platformBurnFee) / MAX_GAS_RATE_DENOMINATOR;
        uint256 leftNative = dy - projectFee - platformFee;

        require(address(this).balance >= dy, "Balance: balance is not enough");
        _burn(from, dx);

        {
            (bool success, ) = _factory.call{value: platformFee}("");
            require(success, "Transfer: charge factory gas failed");
        }
        {
            (bool success, ) = _treasury.call{value: projectFee}("");
            require(success, "Transfer: charge project gas failed");
        }
        {
            if (leftNative > 0) {
                (bool success, ) = to.call{value: leftNative}("");
                require(success, "Transfer: burn failed");
            }
        }

        emit Burned(from, dx, leftNative, platformFee, projectFee);
    }

    function estimateBurn(uint256 erc20Tokens)
        public
        view
        returns (
            uint256 dx,
            uint256 dy,
            uint256 gasBurn
        )
    {
        (dx, dy) = _burning(erc20Tokens, totalSupply());
        gasBurn = (dy * _treasuryBurnFee) / MAX_GAS_RATE_DENOMINATOR;
        gasBurn = gasBurn + (dy * _platformBurnFee) / MAX_GAS_RATE_DENOMINATOR;
        return (dx, dy, gasBurn);
    }

    function price() public view returns (uint256) {
        return _price(totalSupply());
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IHotpotSwap).interfaceId || super.supportsInterface(interfaceId);
    }

    event Mined(address _to, uint256 tokens, uint256 native, uint256 platformFee, uint256 projectFee);

    event Burned(address _from, uint256 tokens, uint256 native, uint256 platformFee, uint256 projectFee);
}
