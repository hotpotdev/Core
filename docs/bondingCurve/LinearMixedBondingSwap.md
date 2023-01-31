# Solidity API

## LinearMixedBondingSwap

### BondingCurveType

```solidity
string BondingCurveType
```

### calculateMintAmountFromBondingCurve

```solidity
function calculateMintAmountFromBondingCurve(uint256 nativeTokenAmount, uint256 daoTokenCurrentSupply, bytes parameters) public pure returns (uint256 daoTokenAmount, uint256)
```

### calculateBurnAmountFromBondingCurve

```solidity
function calculateBurnAmountFromBondingCurve(uint256 daoTokenAmount, uint256 daoTokenCurrentSupply, bytes parameters) public pure returns (uint256, uint256 nativeTokenAmount)
```

### price

```solidity
function price(uint256 daoTokenCurrentSupply, bytes parameters) public pure returns (uint256)
```

