// SPDX-License-Identifier: None

pragma solidity ^0.8.0;

import "../interfaces/IHook.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract BaseHook is IHook {
    address public immutable factory;
    modifier onlyFactory() {
        require(msg.sender == factory, "only factory");
        _;
    }

    constructor(address _factory) {
        factory = _factory;
    }

    function registerHook(address token, bytes calldata data) external virtual override onlyFactory {}

    function unregisterHook(address token) external virtual override onlyFactory {}

    function beforeTransferHook(address from, address to, uint256 amount) external virtual override returns (bool) {
        return true;
    }

    function afterTransferHook(address from, address to, uint256 amount) external virtual override returns (bool) {
        return true;
    }

    function beforeMintHook(address from, address to, uint256 amount) external virtual override returns (bool) {
        return true;
    }

    function afterMintHook(address from, address to, uint256 amount) external virtual override returns (bool) {
        return true;
    }

    function beforeBurnHook(address from, address to, uint256 amount) external virtual override returns (bool) {
        return true;
    }

    function afterBurnHook(address from, address to, uint256 amount) external virtual override returns (bool) {
        return true;
    }
}
