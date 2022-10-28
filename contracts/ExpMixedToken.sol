// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

// openzeppelin
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// abdk-consulting
// "https://github.com/abdk-consulting/abdk-libraries-solidity/blob/master/ABDKMath64x64.sol";
import "./libraries/ABDKMath64x64.sol";

// diy
import "./interfaces/IBondingCurve.sol";
import "./preset/ERC20HotpotMixed.sol";

contract ExpMixedBondingSwap is IBondingCurve {
    using ABDKMath64x64 for int128;
    uint256 public immutable a;
    uint256 public immutable b;

    string public constant BondingCurveType = "exponential";

    constructor(uint256 _a, uint256 _b) {
        // a = 14;
        // b = 2e6;
        a = _a;
        b = _b;
    }

    // x => daoTokenAmount, y => nativeTokenAmount
    // y = (a) e**(x/b)
    // 2000.0 nativeTokenAmount => 9937641.487326497977995709 daoTokenAmount
    // daoTokenAmount = b * ln(e ^ (daoTokenCurrentSupply / b) + nativeTokenAmount / a) - daoTokenCurrentSupply
    function calculateMintAmountFromBondingCurve(uint256 nativeTokenAmount, uint256 daoTokenCurrentSupply)
        public
        view
        override
        returns (uint256 daoTokenAmount, uint256)
    {
        require(daoTokenCurrentSupply < uint256(1 << 192));
        require(nativeTokenAmount < uint256(1 << 192));
        uint256 e_index = (daoTokenCurrentSupply << 64) / (b * 1e18);
        uint256 e_mod = (nativeTokenAmount << 64) / (a * 1e18);
        require(e_index <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF);
        require(e_mod <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF);
        int128 fabdk_e_index = int128(uint128(e_index));
        int128 fabdk_e_mod = int128(uint128(e_mod));
        int128 fabdk_x = (fabdk_e_index.exp() + fabdk_e_mod).ln();
        require(fabdk_x >= 0);
        daoTokenAmount = (((uint256(uint128(fabdk_x))) * b * 1e18) >> 64) - daoTokenCurrentSupply;
        return (daoTokenAmount, nativeTokenAmount);
    }

    // x => daoTokenAmount, y => nativeTokenAmount
    // y = (a) e**(x/b)
    // nativeTokenAmount = a * (e ^ (daoTokenCurrentSupply / b) - e ^ ((daoTokenCurrentSupply - daoTokenAmount) / b))
    function calculateBurnAmountFromBondingCurve(uint256 daoTokenAmount, uint256 daoTokenCurrentSupply)
        public
        view
        override
        returns (uint256, uint256 nativeTokenAmount)
    {
        require(daoTokenCurrentSupply < uint256(1 << 192));
        require(daoTokenAmount < uint256(1 << 192));
        uint256 e_index_1 = (daoTokenCurrentSupply << 64) / (b * 1e18);
        uint256 e_index_0 = ((daoTokenCurrentSupply - daoTokenAmount) << 64) / (b * 1e18);
        require(e_index_1 <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF);
        require(e_index_0 <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF);
        int128 fabdk_e_index_1 = int128(uint128(e_index_1));
        int128 fabdk_e_index_0 = int128(uint128(e_index_0));
        int128 fabdk_y = fabdk_e_index_1.exp() - fabdk_e_index_0.exp();
        require(fabdk_y >= 0);
        nativeTokenAmount = ((uint256(uint128(fabdk_y))) * a * 1e18) >> 64;
        return (daoTokenAmount, nativeTokenAmount);
    }

    // price = a / b * e ^ (daoTokenCurrentSupply / b)
    function price(uint256 daoTokenCurrentSupply) public view override returns (uint256) {
        uint256 e_index = (daoTokenCurrentSupply << 64) / (b * 1e18);
        require(e_index <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF);
        int128 fabdk_e_index = int128(uint128(e_index));
        int128 fabdk_y = fabdk_e_index.exp();
        require(fabdk_y >= 0);
        uint256 p = (((uint256(uint128(fabdk_y))) * a * 1e18) / b) >> 64;
        return p;
    }
}

contract ExpMixedHotpotToken is ERC20HotpotMixed {
    function initialize(
        string memory name,
        string memory symbol,
        address projectAdmin,
        address projectTreasury,
        uint256 projectMintTax,
        uint256 projectBurnTax,
        bytes calldata data
    ) public initializer {
        super.initialize(name, symbol, projectAdmin, projectTreasury, projectMintTax, projectBurnTax, _msgSender());
        (bool hasPreMint, uint256 mintCap, uint256 a, uint256 b) = abi.decode(data, (bool, uint256, uint256, uint256));
        require(mintCap <= a * b * 1e18, "Initialize: mint Cap too large");
        ExpMixedBondingSwap curve = new ExpMixedBondingSwap(a, b);
        _changeCoinMaker(address(curve));

        _initPremint(hasPreMint);
        _setMintCap(mintCap);
    }
}
