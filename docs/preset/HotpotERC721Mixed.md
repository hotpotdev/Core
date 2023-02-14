# Solidity API

## HotpotERC721Mixed

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

### totalSupply

```solidity
function totalSupply() public view returns (uint256)
```

### _calculateMintAmountFromBondingCurve

```solidity
function _calculateMintAmountFromBondingCurve(uint256 _tokens, uint256 _totalSupply) internal view virtual returns (uint256, uint256)
```

### _calculateBurnAmountFromBondingCurve

```solidity
function _calculateBurnAmountFromBondingCurve(uint256 _tokens, uint256 _totalSupply) internal view virtual returns (uint256, uint256)
```

### _mintInternal

```solidity
function _mintInternal(address account, uint256 amount) internal virtual
```

### _afterMint

```solidity
function _afterMint(address account) internal view
```

### _burnInternal

```solidity
function _burnInternal(address, uint256 amount) internal virtual
```

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256, uint256 amount) internal virtual
```

### _baseURI

```solidity
function _baseURI() internal view returns (string)
```

_Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, can be overridden in child contracts._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

_See {IERC165-supportsInterface}._

