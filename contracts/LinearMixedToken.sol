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

    string public constant BondingCurveType = "linear";
    constructor(uint256 _k, uint256 _p) {
        require(_k <= 100000 && _k > 0, "Create: Invalid k");
        require(_p <= 1e24 && _p >= 0, "Create: Invalid p");
        k = _k;
        p = _p;
    }

    // x => erc20, y => native
    // p(x) = x / k + p
    function calculateMintAmountFromBondingCurve(uint256 nativeTokenAmount, uint256 daoTokenCurrentSupply) public view override returns (uint256 daoTokenAmount, uint256 ) {
        uint256 daoTokenCurrentPrice = daoTokenCurrentSupply / k + p;
        daoTokenAmount = ((daoTokenCurrentPrice * daoTokenCurrentPrice + 2 * nativeTokenAmount * 1e18 / k).sqrt() - daoTokenCurrentPrice) * k;
        return (daoTokenAmount, nativeTokenAmount);
    }

    function calculateBurnAmountFromBondingCurve(uint256 daoTokenAmount, uint256 daoTokenCurrentSupply) public view override returns (uint256, uint256 nativeTokenAmount) {
        uint256 daoTokenCurrentPrice = daoTokenCurrentSupply / k + p;
        nativeTokenAmount = (daoTokenCurrentPrice * daoTokenAmount - (daoTokenAmount * daoTokenAmount / k) / 2) / 1e18;
        return (daoTokenAmount, nativeTokenAmount);
    }

    function price(uint256 daoTokenCurrentSupply) public view override returns (uint256) {
        return daoTokenCurrentSupply / k + p;
    }
}

contract LinearMixedHotpotToken is ERC20HotpotMixed {

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
        (bool hasPreMint,uint256 mintCap,uint256 k, uint256 p) = abi.decode(data, (bool, uint256,uint256,uint256));
        require(mintCap <= 1e30, "Initialize: mint Cap too large");
        LinearMixedBondingSwap curve = new LinearMixedBondingSwap(k, p);
        _changeCoinMaker(address(curve));
        
        _initPremint(hasPreMint);
        _setMintCap(mintCap);
    }
}
