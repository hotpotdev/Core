# Solidity API

## Governor

### name

```solidity
string name
```

The name of this contract

### MIN_VOTING_PERIOD

```solidity
uint256 MIN_VOTING_PERIOD
```

The minimum setable voting period

### MAX_VOTING_PERIOD

```solidity
uint256 MAX_VOTING_PERIOD
```

The max setable voting period

### proposalMaxOperations

```solidity
uint256 proposalMaxOperations
```

The maximum number of actions that can be included in a proposal

### DOMAIN_TYPEHASH

```solidity
bytes32 DOMAIN_TYPEHASH
```

The EIP-712 typehash for the contract's domain

### BALLOT_TYPEHASH

```solidity
bytes32 BALLOT_TYPEHASH
```

The EIP-712 typehash for the ballot struct used by the contract

### constructor

```solidity
constructor(address strategyReference_, address strategy_, uint256 votingPeriod_, uint256 votingDelay_, uint256 proposalThreshold_, uint256 quorumVotes, uint256 timelockDelay) public
```

### setStrategy

```solidity
function setStrategy(struct GovernorBravoDelegateStorageV1.Strategy strategy_) external
```

### propose

```solidity
function propose(address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, string description) public returns (uint256)
```

Function used to propose a new proposal. Sender must have delegates above the proposal threshold

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| targets | address[] | Target addresses for proposal calls |
| values | uint256[] | Eth values for proposal calls |
| signatures | string[] | Function signatures for proposal calls |
| calldatas | bytes[] | Calldatas for proposal calls |
| description | string | String description of the proposal |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Proposal id of new proposal |

### queue

```solidity
function queue(uint256 proposalId) external
```

Queues a proposal of state succeeded

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proposalId | uint256 | The id of the proposal to queue |

### queueOrRevertInternal

```solidity
function queueOrRevertInternal(address target, uint256 value, string signature, bytes data, uint256 eta) internal
```

### execute

```solidity
function execute(uint256 proposalId) external payable
```

Executes a queued proposal if eta has passed

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proposalId | uint256 | The id of the proposal to execute |

### cancel

```solidity
function cancel(uint256 proposalId) external
```

Cancels a proposal only if sender is the proposer, or proposer delegates dropped below proposal threshold

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proposalId | uint256 | The id of the proposal to cancel |

### getActions

```solidity
function getActions(uint256 proposalId) external view returns (address[] targets, uint256[] values, string[] signatures, bytes[] calldatas)
```

Gets actions of a proposal

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proposalId | uint256 | the id of the proposal |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| targets | address[] | Targets, values, signatures, and calldatas of the proposal actions |
| values | uint256[] |  |
| signatures | string[] |  |
| calldatas | bytes[] |  |

### getReceipt

```solidity
function getReceipt(uint256 proposalId, address voter) external view returns (struct GovernorBravoDelegateStorageV1.Receipt)
```

Gets the receipt for a voter on a given proposal

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proposalId | uint256 | the id of proposal |
| voter | address | The address of the voter |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct GovernorBravoDelegateStorageV1.Receipt | The voting receipt |

### state

```solidity
function state(uint256 proposalId) public view returns (enum GovernorBravoDelegateStorageV1.ProposalState)
```

Gets the state of a proposal

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proposalId | uint256 | The id of the proposal |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | enum GovernorBravoDelegateStorageV1.ProposalState | Proposal state |

### castVote

```solidity
function castVote(uint256 proposalId, uint8 support) external
```

Cast a vote for a proposal

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proposalId | uint256 | The id of the proposal to vote on |
| support | uint8 | The support value for the vote. 0=against, 1=for, 2=abstain |

### castVoteWithReason

```solidity
function castVoteWithReason(uint256 proposalId, uint8 support, string reason) external
```

Cast a vote for a proposal with a reason

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proposalId | uint256 | The id of the proposal to vote on |
| support | uint8 | The support value for the vote. 0=against, 1=for, 2=abstain |
| reason | string | The reason given for the vote by the voter |

### castVoteBySig

```solidity
function castVoteBySig(uint256 proposalId, uint8 support, uint8 v, bytes32 r, bytes32 s) external
```

Cast a vote for a proposal by signature

_External function that accepts EIP-712 signatures for voting on proposals._

### castVoteInternal

```solidity
function castVoteInternal(address voter, uint256 proposalId, uint8 support) internal returns (uint256)
```

Internal function that caries out voting logic

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| voter | address | The voter that is casting their vote |
| proposalId | uint256 | The id of the proposal to vote on |
| support | uint8 | The support value for the vote. 0=against, 1=for, 2=abstain |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The number of votes cast |

### isWhitelisted

```solidity
function isWhitelisted(address account) public view returns (bool)
```

View function which returns if an account is whitelisted

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | Account to check white list status of |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | If the account is whitelisted |

### _setWhitelistAccountExpiration

```solidity
function _setWhitelistAccountExpiration(address account, uint256 expiration) external
```

Admin function for setting the whitelist expiration as a timestamp for an account. Whitelist status allows accounts to propose without meeting threshold

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | Account address to set whitelist expiration for |
| expiration | uint256 | Expiration for account whitelist status as timestamp (if now < expiration, whitelisted) |

### _setWhitelistGuardian

```solidity
function _setWhitelistGuardian(address account) external
```

Admin function for setting the whitelistGuardian. WhitelistGuardian can cancel proposals from whitelisted addresses

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | Account to set whitelistGuardian to (0x0 to remove whitelistGuardian) |

### _setPendingAdmin

```solidity
function _setPendingAdmin(address newPendingAdmin) external
```

Begins transfer of admin rights. The newPendingAdmin must call `_acceptAdmin` to finalize the transfer.

_Admin function to begin change of admin. The newPendingAdmin must call `_acceptAdmin` to finalize the transfer._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newPendingAdmin | address | New pending admin. |

### _acceptAdmin

```solidity
function _acceptAdmin() external
```

Accepts transfer of admin rights. msg.sender must be pendingAdmin

_Admin function for pending admin to accept role and update admin_

### getChainIdInternal

```solidity
function getChainIdInternal() internal view returns (uint256)
```

