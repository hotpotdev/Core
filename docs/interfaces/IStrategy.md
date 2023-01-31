# Solidity API

## IStrategy

### name

```solidity
function name() external pure returns (string)
```

### getThreshold

```solidity
function getThreshold(address ref, uint256 thresholdParameter, uint256 blockNumber) external view returns (uint256)
```

### getPastVotes

```solidity
function getPastVotes(address ref, address account, uint256 blockNumber) external view returns (uint256)
```

