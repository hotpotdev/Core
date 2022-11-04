// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

// openzeppelin
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// diy
import "./interfaces/IBondingCurve.sol";
import "./preset/ERC20HotpotMixed.sol";
import "./libraries/ABDKMath.sol";

contract SqrtMixedBondingSwap is IBondingCurve {
    using ABDKMath for uint256;
    uint256 public immutable a;

    string public constant BondingCurveType = "logarithm";

    constructor(uint256 _a) {
        a = _a;
    }

    // x => erc20, y => native
    // p(x) = a * sqrt(x)
    function calculateMintAmountFromBondingCurve(uint256 nativeTokenAmount, uint256 daoTokenCurrentSupply)
        public
        view
        override
        returns (uint256 daoTokenAmount, uint256)
    {
        uint256 sdb = daoTokenCurrentSupply.sqrt();
        uint256 cna = ( 3e9 * nativeTokenAmount / ( 2 * a ) + sdb * sdb * sdb ).cuberoot();
        daoTokenAmount = cna * cna - daoTokenCurrentSupply;
        return (daoTokenAmount, nativeTokenAmount);
    }

    function calculateBurnAmountFromBondingCurve(uint256 daoTokenAmount, uint256 daoTokenCurrentSupply)
        public
        view
        override
        returns (uint256, uint256 nativeTokenAmount)
    {
        uint256 sdb = daoTokenCurrentSupply.sqrt();
        uint256 sda = (daoTokenCurrentSupply - daoTokenAmount).sqrt();
        nativeTokenAmount = 2 * a * ( sdb * sdb * sdb - sda * sda * sda ) / 3e9;
        return (daoTokenAmount, nativeTokenAmount);
    }

    function price(uint256 daoTokenCurrentSupply) public view override returns (uint256) {
        return a * daoTokenCurrentSupply.sqrt() * 1e9;
    }
}

contract SqrtMixedHotpotToken is ERC20HotpotMixed {
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
        (bool hasPreMint, uint256 mintCap, uint256 a) = abi.decode(data, (bool, uint256, uint256));
        require(mintCap <= 1e30, "Initialize: mint Cap too large");
        SqrtMixedBondingSwap curve = new SqrtMixedBondingSwap(a);
        _changeCoinMaker(address(curve));

        _initPremint(hasPreMint);
        _setMintCap(mintCap);
    }
}
