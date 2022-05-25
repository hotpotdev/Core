// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

// openzeppelin
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// diy
import "./interfaces/IBondingCurve.sol";
import "./preset/ERC20HotpotMixed.sol";
import "./libraries/ABDKMath.sol";
contract LinearMixedBondingSwap is IBondingCurve {

    using ABDKMath for uint256;
    uint immutable k;
    uint immutable p;
    constructor (uint _k,uint _p) {
        require(_k<10000&&_k>0, 'Create: Invalid k');
        require(_p<1e24&&_p>=0, 'Create: Invalid p');
        k = _k;
        p = _p;
    }
    // F(x) = (1/2) (1/k) x**2 + p x
    
    function mining(uint256 nativeTokens, uint256 erc20Supply) public override view returns(uint256 dx, uint256 dy) {
        dy = nativeTokens;
        uint erc20CurrentPrice = k * erc20Supply + p;
        dx = ((erc20CurrentPrice * erc20CurrentPrice + 2 * k * dy * 1e18).sqrt() - erc20CurrentPrice)/ k;
        return (dx,dy);
    }

    // (dx,dy) = Fx(erc20Supply) - Fx(erc20Supply-dx)
    function burning(uint256 erc20Tokens, uint256 erc20Supply) public override view returns(uint256 dx, uint256 dy) {
        dx = erc20Tokens;
        uint currentErc20Price = k * erc20Supply + p;
        dy = (currentErc20Price * erc20Tokens - k * erc20Tokens * erc20Tokens / 2) / 1e18;
        return (dx,dy);
    }

    function price(uint256 erc20Supply) public override view returns(uint256) {
        return erc20Supply / k + p;
    }
}


contract LinearMixedHotpotToken is ERC20HotpotMixed {
    //
    constructor(string memory name, string memory symbol, address treasury,uint mintRate,uint burnRate,address platform,uint k,uint p) ERC20(name, symbol){

        _initTreasury(treasury);
        _initPlatform(platform);

        _setTaxRate(mintRate, burnRate);

        LinearMixedBondingSwap curve = new LinearMixedBondingSwap(k,p);
        _changeCoinMaker(address(curve));

        _setupRole(PLATFORM_ROLE, _platform);
        _setupRole(PROJECT_ROLE, _treasury);
        _setupRole(PREMINT_ROLE, _treasury);
        _setRoleAdmin(PREMINT_ROLE, PROJECT_ROLE);

        _initPremint();
        _setMintCap(1e36);
    }
}
