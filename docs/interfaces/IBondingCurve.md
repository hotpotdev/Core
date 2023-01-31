# Solidity API

## IBondingCurve

### BondingCurveType

```solidity
function BondingCurveType() external view returns (string)
```

### calculateMintAmountFromBondingCurve

```solidity
function calculateMintAmountFromBondingCurve(uint256 tokens, uint256 totalSupply, bytes parameters) external view returns (uint256 x, uint256 y)
```

### calculateBurnAmountFromBondingCurve

```solidity
function calculateBurnAmountFromBondingCurve(uint256 tokens, uint256 totalSupply, bytes parameters) external view returns (uint256 x, uint256 y)
```

### price

```solidity
function price(uint256 totalSupply, bytes parameters) external view returns (uint256 price)
```

