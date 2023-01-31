# Solidity API

## IGnosis

### getThreshold

```solidity
function getThreshold() external view returns (uint256)
```

### isOwner

```solidity
function isOwner(address owner) external view returns (bool)
```

### getOwners

```solidity
function getOwners() external view returns (address[])
```

## GnosisStrategy

### name

```solidity
function name() external pure returns (string)
```

### getThreshold

```solidity
function getThreshold(address ref, uint256, uint256) external view returns (uint256)
```

### getPastVotes

```solidity
function getPastVotes(address ref, address account, uint256) external view returns (uint256)
```

