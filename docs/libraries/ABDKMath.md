# Solidity API

## ABDKMath

### sqrt

```solidity
function sqrt(uint256 x) internal pure returns (uint256)
```

copy of internal function sqrtu from
https://github.com/abdk-consulting/abdk-libraries-solidity/blob/master/ABDKMath64x64.sol
Calculate sqrt (x) rounding down, where x is unsigned 256-bit integer
number.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | uint256 | unsigned 256-bit integer number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | unsigned 128-bit integer number |

### cuberoot

```solidity
function cuberoot(uint256 y) internal pure returns (uint256 z)
```

