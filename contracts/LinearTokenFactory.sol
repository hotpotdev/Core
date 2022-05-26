// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "hardhat/console.sol";
import "./LinearMixedToken.sol";
contract LinearHotpotTokenFactory is LinearMixedHotpotToken{

    constructor(string memory name, string memory symbol, address treasury,uint mintRate,uint burnRate,address platform) LinearMixedHotpotToken(name,symbol,treasury,mintRate,burnRate,platform,100,1e16,false,1e36){
        // console.log("Deploying",name,symbol,treasury,mintRate,burnRate,platform);
        // console.log("Deploying",name,symbol,name);
    }
    
}
