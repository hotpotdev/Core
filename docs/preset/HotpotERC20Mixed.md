# Solidity API

## HotpotERC20Mixed

### MAX_TAX_RATE_DENOMINATOR

```solidity
uint256 MAX_TAX_RATE_DENOMINATOR
```

### MAX_PROJECT_TAX_RATE

```solidity
uint256 MAX_PROJECT_TAX_RATE
```

### _projectMintTax

```solidity
uint256 _projectMintTax
```

### _projectBurnTax

```solidity
uint256 _projectBurnTax
```

### initialize

```solidity
function initialize(address bondingCurveAddress, string name, string symbol, string metadata, address projectAdmin, address projectTreasury, uint256 projectMintTax, uint256 projectBurnTax, bool isSbt, bytes parameters, address factory) public
```

### setProjectTaxRate

```solidity
function setProjectTaxRate(uint256 projectMintTax, uint256 projectBurnTax) public
```

### getTaxRateOfProject

```solidity
function getTaxRateOfProject() public view returns (uint256 projectMintTax, uint256 projectBurnTax)
```

### getTaxRateOfPlatform

```solidity
function getTaxRateOfPlatform() public view returns (uint256 platformMintTax, uint256 platformBurnTax)
```

### _getCurrentSupply

```solidity
function _getCurrentSupply() internal view returns (uint256)
```

### mint

```solidity
function mint(address to, uint256 minDaoTokenRecievedAmount) public payable returns (uint256)
```

### estimateMint

```solidity
function estimateMint(uint256 nativeTokenPaidAmount) public view returns (uint256 daoTokenAmount, uint256, uint256 platformFee, uint256 projectFee)
```

_前端估算mint的铸造_

### burn

```solidity
function burn(address to, uint256 daoTokenPaidAmount, uint256 minNativeTokenRecievedAmount) public returns (uint256)
```

_burn实现的是将 daoToken打入bonding curve销毁，bonding curve计算相应的以太坊，再扣除手续费后将eth兑出的功能_

### estimateBurn

```solidity
function estimateBurn(uint256 daoTokenAmount) public view returns (uint256, uint256 nativeTokenAmount, uint256 platformFee, uint256 projectFee)
```

### price

```solidity
function price() public view returns (uint256)
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._

### _setProjectTaxRate

```solidity
function _setProjectTaxRate(uint256 projectMintTax, uint256 projectBurnTax) internal
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

### estimateMintNeed

```solidity
function estimateMintNeed(uint256 tokenAmountWant) external view returns (uint256 daoTokenAmount, uint256 nativeTokenPaidAmount, uint256 platformFee, uint256 projectFee)
```

### LogProjectTaxChanged

```solidity
event LogProjectTaxChanged()
```

### LogMint

```solidity
event LogMint(address to, uint256 daoTokenAmount, uint256 nativeTokenAmount, uint256 platformFee, uint256 projectFee)
```

### LogBurned

```solidity
event LogBurned(address from, uint256 daoTokenAmount, uint256 nativeTokenAmount, uint256 platformFee, uint256 projectFee)
```

