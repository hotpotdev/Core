# Solidity API

## HotpotERC20Mixed

### initialize

```solidity
function initialize(address bondingCurveAddress, string name, string symbol, string metadata, address projectAdmin, address projectTreasury, uint256 projectMintTax, uint256 projectBurnTax, bool isSbt, address raisingTokenAddr, bytes parameters, address factory) public
```

_Initializes the hotpot token contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| bondingCurveAddress | address | Address of the bonding curve contract. |
| name | string | Name of the token. |
| symbol | string | Symbol of the token. |
| metadata | string | Metadata URL for the token. |
| projectAdmin | address | Address of the project administrator. |
| projectTreasury | address | Address of the project treasury. |
| projectMintTax | uint256 | Tax rate for project token minting. |
| projectBurnTax | uint256 | Tax rate for project token burning. |
| isSbt | bool | Flag indicating whether the token is a SBT. |
| raisingTokenAddr | address | Address of the raising token. |
| parameters | bytes | Parameters for the bonding curve contract. |
| factory | address | Address of the factory contract. |

### _getCurrentSupply

```solidity
function _getCurrentSupply() internal view returns (uint256)
```

### _mintInternal

```solidity
function _mintInternal(address account, uint256 amount) internal virtual
```

### _burnInternal

```solidity
function _burnInternal(address account, uint256 amount) internal virtual
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual
```

_Hook that is called before any transfer of tokens. This includes
minting and burning.

Calling conditions:

- when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
will be transferred to `to`.
- when `from` is zero, `amount` tokens will be minted for `to`.
- when `to` is zero, `amount` of ``from``'s tokens will be burned.
- `from` and `to` are never both zero.

To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

