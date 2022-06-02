// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;

contract HotpotMetadata{

    string private _meta; 

    function _setMetadata(string memory uri) internal {
        _meta = uri;
        emit MetadataChanged();
    }

    function getMetadata() public view virtual returns (string memory){
        return _meta;
    }

    event MetadataChanged();
}