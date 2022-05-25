// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

// openzeppelin
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// diy
import "../abstract/HotpotERC20Base.sol";
import "../interfaces/IHotpotSwap.sol";


abstract contract ERC20HotpotX2Y is HotpotERC20Base,IHotpotSwap,ReentrancyGuard {

    uint internal constant MAX_GAS_RATE_DENOMINATOR = 10000;
    uint internal constant _platformMintFee = 100;
    uint internal constant _platformBurnFee = 100;

    uint internal _treasuryMintFee = 100;
    uint internal _treasuryBurnFee = 100;
    uint internal _mintFeeDivisor = MAX_GAS_RATE_DENOMINATOR;
    uint internal _burnFeeDivisor = MAX_GAS_RATE_DENOMINATOR;

    function _setTaxRate(uint mintRate,uint burnRate) internal {
        _treasuryMintFee = mintRate;
        _treasuryBurnFee = burnRate;
        _mintFeeDivisor = MAX_GAS_RATE_DENOMINATOR - _platformMintFee - _treasuryMintFee;
        _burnFeeDivisor = MAX_GAS_RATE_DENOMINATOR - _platformBurnFee - _treasuryBurnFee;
        require(_mintFeeDivisor>0, "SetTax: Invalid number");
        require(_burnFeeDivisor>0, "SetTax: Invalid number");
    }


    function getTaxRate() public view returns(uint _projectMintRate,uint projectBurnRate,uint platformMintRate,uint platformBurnRate) {
        return (_treasuryMintFee,_treasuryBurnFee,_projectMintRate,projectBurnRate);
    }

    /**
     * @dev mint
     */
    function mint(address to, uint erc20Tokens) public payable whenNotPaused nonReentrant{
        if(premint()) {
            _checkRole(PREMINT_ROLE,_msgSender());
        }
        // Calculate the actual amount through Bonding Curve
        uint dx = erc20Tokens;
        uint dy;
        (dx, dy) = _mining(erc20Tokens, totalSupply());
        require(dx > 1e9 && dy > 1e9, 'Mint: token amount is too low');

        uint projectFee = dy * _treasuryMintFee / _mintFeeDivisor;
        uint platformFee = dy * _platformMintFee / _mintFeeDivisor;
        uint needNative = dy + projectFee + platformFee;
        require(needNative <= msg.value, 'Mint: value is too low');
        require(totalSupply()+dx<=cap(), 'Mint: exceed upper limit');
        
        _mint(to,dx);

        payable(_treasury).transfer(projectFee);
        payable(_platform).transfer(platformFee);
        // The extra value is transferred to the sender itself
        uint left = msg.value - needNative;
        if(left > 0) {
            payable(_msgSender()).transfer(left);
        }

        emit Mined(to, dx, dy, platformFee, projectFee);
    }

    /**
     * @dev testMint
     */
    function estimateMint(uint erc20Tokens) public view returns (uint dx, uint dy, uint gasMint) {
        (dx, dy) = _mining(erc20Tokens, totalSupply());
        gasMint = dy * _treasuryMintFee / _mintFeeDivisor;
        gasMint = gasMint + dy * _platformMintFee / _mintFeeDivisor;
        return (dx, dy, gasMint);
    }

    /**
     * @dev burn
     */
    function burn(address to,uint erc20Tokens) public payable whenNotPaused nonReentrant{
        require(msg.value==0,'Burn: dont need to attach ether');
        address from = _msgSender();
        uint dx = erc20Tokens;
        uint dy;
        // Calculate the actual amount through Bonding Curve
        (dx, dy) = _burning(erc20Tokens, totalSupply());
        require(dx > 1e9 && dy > 1e9, 'Balance: token amount is too low');

        uint projectFee = dy * _treasuryBurnFee / MAX_GAS_RATE_DENOMINATOR;
        uint platformFee = dy * _platformBurnFee / MAX_GAS_RATE_DENOMINATOR;
        uint leftNative = dy - projectFee - platformFee;

        require(address(this).balance >= dy, 'Balance: balance is not enough');
        _burn(from,dx);

        {
            (bool success,) = _platform.call{value: platformFee}("");
            require(success);
        }
        {
            (bool success,) = _treasury.call{value: projectFee}("");
            require(success);
        }
        {
            (bool success,) = to.call{value: leftNative}("");
            require(success);
        }

        emit Burned(from, dx, dy, platformFee, projectFee);
    }

    function estimateBurn(uint erc20Tokens) public view returns (uint dx, uint dy, uint gasBurn) {
        (dx, dy) = _burning(erc20Tokens, totalSupply());
        gasBurn = dy * _treasuryBurnFee / MAX_GAS_RATE_DENOMINATOR;
        gasBurn = gasBurn + dy * _platformBurnFee / MAX_GAS_RATE_DENOMINATOR;
        return (dx, dy, gasBurn);
    }
    
    function price() public view returns (uint) {
        return _price(totalSupply());
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IHotpotSwap).interfaceId || super.supportsInterface(interfaceId);
    }

    event Mined(address _to, uint tokens, uint native, uint platformFee, uint projectFee);

    event Burned(address _from, uint tokens, uint native, uint platformFee, uint projectFee);
}