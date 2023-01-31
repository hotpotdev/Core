# Solidity API

## GovernorLib

### GovInfo

```solidity
struct GovInfo {
  address strategyReference;
  address strategy;
  uint256 votingPeriod;
  uint256 votingDelay;
  uint256 proposalThreshold;
  uint256 quorumVotes;
  uint256 timelockDelay;
}
```

### LogGovernorCreated

```solidity
event LogGovernorCreated(address proxyAddr, address govAddr)
```

### createGovernorForToken

```solidity
function createGovernorForToken(address proxyAddr, struct GovernorLib.GovInfo govInfo) public
```

