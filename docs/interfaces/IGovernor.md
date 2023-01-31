# Solidity API

## GovernorBravoEvents

### ProposalCreated

```solidity
event ProposalCreated(uint256 id, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description, string strategyName)
```

An event emitted when a new proposal is created

### VoteCast

```solidity
event VoteCast(address voter, uint256 proposalId, uint8 support, uint256 votes, string reason)
```

An event emitted when a vote has been cast on a proposal

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| voter | address | The address which casted a vote |
| proposalId | uint256 | The proposal id which was voted on |
| support | uint8 | Support value for the vote. 0=against, 1=for, 2=abstain |
| votes | uint256 | Number of votes which were cast by the voter |
| reason | string | The reason given for the vote by the voter |

### ProposalCanceled

```solidity
event ProposalCanceled(uint256 id)
```

An event emitted when a proposal has been canceled

### ProposalQueued

```solidity
event ProposalQueued(uint256 id, uint256 eta)
```

An event emitted when a proposal has been queued in the Timelock

### ProposalExecuted

```solidity
event ProposalExecuted(uint256 id)
```

An event emitted when a proposal has been executed in the Timelock

### NewImplementation

```solidity
event NewImplementation(address oldImplementation, address newImplementation)
```

Emitted when implementation is changed

### StrategySet

```solidity
event StrategySet(uint256 proposalThreshold, uint256 votingPeriod, uint256 votingDelay, uint256 quorumVotes, address addr, address strategyReference)
```

Emitted when proposal threshold is set

### NewPendingAdmin

```solidity
event NewPendingAdmin(address oldPendingAdmin, address newPendingAdmin)
```

Emitted when pendingAdmin is changed

### NewAdmin

```solidity
event NewAdmin(address oldAdmin, address newAdmin)
```

Emitted when pendingAdmin is accepted, which means admin is updated

### WhitelistAccountExpirationSet

```solidity
event WhitelistAccountExpirationSet(address account, uint256 expiration)
```

Emitted when whitelist account expiration is set

### WhitelistGuardianSet

```solidity
event WhitelistGuardianSet(address oldGuardian, address newGuardian)
```

Emitted when the whitelistGuardian is set

## GovernorBravoDelegatorStorage

### admin

```solidity
address admin
```

Administrator for this contract

### pendingAdmin

```solidity
address pendingAdmin
```

Pending administrator for this contract

### implementation

```solidity
address implementation
```

Active brains of Governor

## GovernorBravoDelegateStorageV1

For future upgrades, do not change GovernorBravoDelegateStorageV1. Create a new
contract which implements GovernorBravoDelegateStorageV1 and following the naming convention
GovernorBravoDelegateStorageVX.

### Strategy

```solidity
struct Strategy {
  uint256 votingPeriod;
  uint256 votingDelay;
  uint256 proposalThreshold;
  uint256 quorumVotes;
  address addr;
  address referenceAddr;
}
```

### proposalCount

```solidity
uint256 proposalCount
```

The total number of proposals

### timelock

```solidity
contract TimelockInterface timelock
```

The address of the  Protocol Timelock

### proposals

```solidity
mapping(uint256 => struct GovernorBravoDelegateStorageV1.Proposal) proposals
```

The official record of all proposals ever proposed

### latestProposalIds

```solidity
mapping(address => uint256) latestProposalIds
```

The latest proposal for each proposer

### Proposal

```solidity
struct Proposal {
  uint256 id;
  address proposer;
  uint256 eta;
  uint256 startBlock;
  uint256 endBlock;
  uint256 forVotes;
  uint256 againstVotes;
  uint256 abstainVotes;
  bool canceled;
  bool executed;
  string description;
  struct GovernorBravoDelegateStorageV1.Strategy strategy;
}
```

### Receipt

```solidity
struct Receipt {
  bool hasVoted;
  uint8 support;
  uint256 votes;
}
```

### ProposalState

```solidity
enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed
}
```

## GovernorBravoDelegateStorageV2

### whitelistAccountExpirations

```solidity
mapping(address => uint256) whitelistAccountExpirations
```

Stores the expiration of account whitelist status as a timestamp

### whitelistGuardian

```solidity
address whitelistGuardian
```

Address which manages whitelisted proposals and whitelist accounts

### _targets

```solidity
mapping(uint256 => address[]) _targets
```

### _values

```solidity
mapping(uint256 => uint256[]) _values
```

### _signatures

```solidity
mapping(uint256 => string[]) _signatures
```

### _calldatas

```solidity
mapping(uint256 => bytes[]) _calldatas
```

### _receipts

```solidity
mapping(bytes32 => struct GovernorBravoDelegateStorageV1.Receipt) _receipts
```

### strategy

```solidity
struct GovernorBravoDelegateStorageV1.Strategy strategy
```

## TimelockInterface

### delay

```solidity
function delay() external view returns (uint256)
```

### GRACE_PERIOD

```solidity
function GRACE_PERIOD() external view returns (uint256)
```

### acceptAdmin

```solidity
function acceptAdmin() external
```

### queuedTransactions

```solidity
function queuedTransactions(bytes32 hash) external view returns (bool)
```

### queueTransaction

```solidity
function queueTransaction(address target, uint256 value, string signature, bytes data, uint256 eta) external returns (bytes32)
```

### cancelTransaction

```solidity
function cancelTransaction(address target, uint256 value, string signature, bytes data, uint256 eta) external
```

### executeTransaction

```solidity
function executeTransaction(address target, uint256 value, string signature, bytes data, uint256 eta) external payable returns (bytes)
```

## GovernorAlpha

### proposalCount

```solidity
function proposalCount() external returns (uint256)
```

The total number of proposals

