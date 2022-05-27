// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

// openzeppelin
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// abdk-consulting
// import "https://github.com/abdk-consulting/abdk-libraries-solidity/blob/master/ABDKMath64x64.sol";
import "./libraries/ABDKMath64x64.sol";

// diy
import "./interfaces/IBondingCurve.sol";
import "./preset/ERC20HotpotMixed.sol";

contract ExpMixedBondingSwap is IBondingCurve {
    using ABDKMath64x64 for int128;
    uint256 public immutable a;
    uint256 public immutable b;

    constructor() {
        a = 14;
        b = 2e6;
    }

    // F(x) = (a) e**(x/b)
    // 25000000000000000000000000 => 498273,592589687761195622
    // 2000000000000000000000 => 10000000000000000000000000
    // (dx,dy) = Fx(totalSupply+dx) - Fx(totalSupply)
    function mining(uint256 nativeTokens, uint256 erc20Supply) public view override returns (uint256 dx, uint256 dy) {
        dy = nativeTokens;
        require(erc20Supply < uint256(1 << 192));
        require(nativeTokens < uint256(1 << 192));
        uint256 e_index = (erc20Supply << 64) / (b * 1e18);
        uint256 e_mod = (nativeTokens << 64) / (a * 1e18);
        int128 fabdk_e_index = 0;
        int128 fabdk_e_mod = 0;
        unchecked {
            require(e_index <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF);
            require(e_mod <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF);
            fabdk_e_index = int128(uint128(e_index));
            fabdk_e_mod = int128(uint128(e_mod));
        }
        int128 fabdk_x = (fabdk_e_index.exp() + fabdk_e_mod).ln();
        unchecked {
            require(fabdk_x >= 0);
            dx = (((uint256(uint128(fabdk_x))) * b * 1e18) >> 64) - erc20Supply;
            return (dx, dy);
        }
    }

    // (dx,dy) = Fx(erc20Supply) - Fx(erc20Supply-dx)
    function burning(uint256 erc20Tokens, uint256 erc20Supply) public view override returns (uint256 dx, uint256 dy) {
        dx = erc20Tokens;
        require(erc20Supply < uint256(1 << 192));
        require(erc20Tokens < uint256(1 << 192));
        uint256 e_index_1 = (erc20Supply << 64) / (b * 1e18);
        uint256 e_index_0 = ((erc20Supply - erc20Tokens) << 64) / (b * 1e18);
        int128 fabdk_e_index_1 = 0;
        int128 fabdk_e_index_0 = 0;
        unchecked {
            require(e_index_1 <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF);
            require(e_index_0 <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF);
            fabdk_e_index_1 = int128(uint128(e_index_1));
            fabdk_e_index_0 = int128(uint128(e_index_0));
        }
        int128 fabdk_y = fabdk_e_index_1.exp() - fabdk_e_index_0.exp();
        unchecked {
            require(fabdk_y >= 0);
            dy = ((uint256(uint128(fabdk_y))) * a * 1e18) >> 64;
            return (dx, dy);
        }
    }

    function price(uint256 erc20Supply) public view override returns (uint256) {
        (uint256 x, uint256 y) = burning(1e18, erc20Supply + 1e18);
        return (y * 1e18) / x;
    }
}

contract ExpMixedHotpotToken is ERC20HotpotMixed {
    function initialize(
        string memory name,
        string memory symbol,
        address treasury,
        uint256 mintRate,
        uint256 burnRate,
        address factory,
        bool hasPreMint,
        uint256 mintCap,
        bytes calldata data
    ) public initializer {
        require(_factory == address(0), "factory has been set");
        super.initialize(name, symbol, treasury, mintRate, burnRate, msg.sender, hasPreMint, mintCap);
        ExpMixedBondingSwap curve = new ExpMixedBondingSwap();
        _changeCoinMaker(address(curve));
    }
}
