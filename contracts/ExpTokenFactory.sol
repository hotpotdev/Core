// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "hardhat/console.sol";
import "./ExpMixedToken.sol";
contract ExpHotpotTokenFactory is ExpMixedHotpotToken{

    constructor(string memory name, string memory symbol, address treasury,uint mintRate,uint burnRate,address platform) ExpMixedHotpotToken(name,symbol,treasury,mintRate,burnRate,platform){
    }
    
}
