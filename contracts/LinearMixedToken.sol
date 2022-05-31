// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

// openzeppelin
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// diy
import "./interfaces/IBondingCurve.sol";
import "./preset/ERC20HotpotMixed.sol";
import "./libraries/ABDKMath.sol";

contract LinearMixedBondingSwap is IBondingCurve {
    using ABDKMath for uint256;
    uint256 public immutable k;
    uint256 public immutable p;

    constructor(uint256 _k, uint256 _p) {
        require(_k <= 100000 && _k > 0, "Create: Invalid k");
        require(_p <= 1e24 && _p >= 0, "Create: Invalid p");
        k = _k;
        p = _p;
    }

    // F(x) = (1/2) (1/k) x**2 + p x

    function mining(uint256 nativeTokens, uint256 erc20Supply) public view override returns (uint256 dx, uint256 dy) {
        dy = nativeTokens;
        uint256 erc20CurrentPrice = erc20Supply / k + p;
        dx = ((erc20CurrentPrice * erc20CurrentPrice + 2 * dy * 1e18 / k).sqrt() - erc20CurrentPrice) * k;
        return (dx, dy);
    }

    // (dx,dy) = Fx(erc20Supply) - Fx(erc20Supply-dx)
    function burning(uint256 erc20Tokens, uint256 erc20Supply) public view override returns (uint256 dx, uint256 dy) {
        dx = erc20Tokens;
        uint256 erc20CurrentPrice = erc20Supply / k + p;
        dy = (erc20CurrentPrice * erc20Tokens - (erc20Tokens * erc20Tokens / k) / 2) / 1e18;
        return (dx, dy);
    }

    function price(uint256 erc20Supply) public view override returns (uint256) {
        return erc20Supply / k + p;
    }
}

contract LinearMixedHotpotToken is ERC20HotpotMixed {
    //

    function initialize(
        string memory name,
        string memory symbol,
        address treasury,
        uint256 mintRate,
        uint256 burnRate,
        bool hasPreMint,
        uint256 mintCap,
        bytes calldata data
    ) public initializer {
        require(mintCap <= 1e30, "Initialize: mint Cap too large");
        super.initialize(name, symbol, treasury, mintRate, burnRate, msg.sender, hasPreMint, mintCap);
        (uint256 k, uint256 p) = abi.decode(data, (uint256, uint256));
        LinearMixedBondingSwap curve = new LinearMixedBondingSwap(k, p);
        _changeCoinMaker(address(curve));
    }
}
