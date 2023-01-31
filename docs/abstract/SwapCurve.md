# Solidity API

## SwapCurve

### _bondingCurveParameters

```solidity
bytes _bondingCurveParameters
```

### _coinMaker

```solidity
contract IBondingCurve _coinMaker
```

### LogCoinMakerChanged

```solidity
event LogCoinMakerChanged(address _from, address _to)
```

### _changeCoinMaker

```solidity
function _changeCoinMaker(address newBonding) internal
```

### _calculateMintAmountFromBondingCurve

```solidity
function _calculateMintAmountFromBondingCurve(uint256 tokens, uint256 totalSupply) internal view returns (uint256, uint256)
```

### _calculateBurnAmountFromBondingCurve

```solidity
function _calculateBurnAmountFromBondingCurve(uint256 tokens, uint256 totalSupply) internal view returns (uint256, uint256)
```

### _price

```solidity
function _price(uint256 totalSupply) internal view returns (uint256)
```

### getBondingCurve

```solidity
function getBondingCurve() public view returns (address)
```

### getParameters

```solidity
function getParameters() public view returns (bytes)
```

