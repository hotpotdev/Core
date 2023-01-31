# Solidity API

## HotpotTokenFactory

### PLATFORM_ADMIN_ROLE

```solidity
bytes32 PLATFORM_ADMIN_ROLE
```

### receive

```solidity
receive() external payable
```

### fallback

```solidity
fallback() external payable
```

### initialize

```solidity
function initialize(address platformAdmin, address platformTreasury) public
```

### deployToken

```solidity
function deployToken(struct IHotpotFactory.TokenInfo token) public payable
```

### createGovernorForToken

```solidity
function createGovernorForToken(address proxyAddr, struct GovernorLib.GovInfo govInfo) public
```

### setPlatformTaxRate

```solidity
function setPlatformTaxRate(uint256 platformMintTax, uint256 platformBurnTax) public
```

### getTaxRateOfPlatform

```solidity
function getTaxRateOfPlatform() public view returns (uint256 platformMintTax, uint256 platformBurnTax)
```

### addBondingCurveImplement

```solidity
function addBondingCurveImplement(address impl) public
```

### getBondingCurveImplement

```solidity
function getBondingCurveImplement(string bondingCurveType) public view returns (address impl)
```

### updateHotpotImplement

```solidity
function updateHotpotImplement(string tokenType, address impl) public
```

### getHotpotImplement

```solidity
function getHotpotImplement(string tokenType) public view returns (address impl)
```

### getTokensLength

```solidity
function getTokensLength() public view returns (uint256 len)
```

### getToken

```solidity
function getToken(uint256 index) public view returns (address addr)
```

### getPlatformAdmin

```solidity
function getPlatformAdmin() public view returns (address)
```

### getPlatformTreasury

```solidity
function getPlatformTreasury() public view returns (address)
```

### setPlatformAdmin

```solidity
function setPlatformAdmin(address newPlatformAdmin) public
```

### setPlatformTreasury

```solidity
function setPlatformTreasury(address newPlatformTreasury) public
```

### declareDoomsday

```solidity
function declareDoomsday(address proxyAddress) external
```

### pause

```solidity
function pause(address proxyAddress) external
```

### unpause

```solidity
function unpause(address proxyAddress) external
```

### requestUpgrade

```solidity
function requestUpgrade(address proxyAddress, bytes data) external
```

### rejectUpgrade

```solidity
function rejectUpgrade(address proxyAddress, string reason) external
```

### upgradeTokenImplement

```solidity
function upgradeTokenImplement(address proxyAddress) external payable
```

## HotpotBase

### FACTORY_ROLE

```solidity
bytes32 FACTORY_ROLE
```

### PROJECT_ADMIN_ROLE

```solidity
bytes32 PROJECT_ADMIN_ROLE
```

### _projectTreasury

```solidity
address _projectTreasury
```

### _projectAdmin

```solidity
address _projectAdmin
```

### _factory

```solidity
contract IHotpotFactory _factory
```

### _isSbt

```solidity
bool _isSbt
```

### whenNotPaused

```solidity
modifier whenNotPaused()
```

### getProjectAdminRole

```solidity
function getProjectAdminRole() external pure returns (bytes32 role)
```

### doomsday

```solidity
function doomsday() public view returns (bool)
```

### getFactory

```solidity
function getFactory() public view returns (address)
```

### getProjectAdmin

```solidity
function getProjectAdmin() public view returns (address)
```

### getProjectTreasury

```solidity
function getProjectTreasury() public view returns (address)
```

### setMetadata

```solidity
function setMetadata(string url) public
```

### paused

```solidity
function paused() public view returns (bool)
```

### pause

```solidity
function pause() public
```

### unpause

```solidity
function unpause() public
```

### declareDoomsday

```solidity
function declareDoomsday() public
```

### setProjectAdmin

```solidity
function setProjectAdmin(address newProjectAdmin) public
```

### setGov

```solidity
function setGov(address gov) public
```

### setProjectTreasury

```solidity
function setProjectTreasury(address newProjectTreasury) public
```

### destroyForDoomsday

```solidity
function destroyForDoomsday() public
```

### _initProject

```solidity
function _initProject(address projectAdmin, address projectTreasury) internal
```

### _initFactory

```solidity
function _initFactory(address account) internal
```

### _declareDoomsday

```solidity
function _declareDoomsday() internal
```

### _destroy

```solidity
function _destroy() internal
```

### isSbt

```solidity
function isSbt() public view returns (bool)
```

### LogDeclareDoomsday

```solidity
event LogDeclareDoomsday(address account)
```

### LogDestroyed

```solidity
event LogDestroyed(address account)
```

### LogProjectAdminChanged

```solidity
event LogProjectAdminChanged(address newAccount)
```

### LogProjectTreasuryChanged

```solidity
event LogProjectTreasuryChanged(address newAccount)
```

### Paused

```solidity
event Paused(address account)
```

### Unpaused

```solidity
event Unpaused(address account)
```

### fallback

```solidity
fallback() external
```

## HotpotMetadata

### _setMetadata

```solidity
function _setMetadata(string uri) internal
```

### getMetadata

```solidity
function getMetadata() public view virtual returns (string)
```

### LogMetadataChanged

```solidity
event LogMetadataChanged()
```

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

## ExpMixedBondingSwap

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

## SqrtMixedBondingSwap

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

## Timelock

### NewAdmin

```solidity
event NewAdmin(address newAdmin)
```

### NewPendingAdmin

```solidity
event NewPendingAdmin(address newPendingAdmin)
```

### NewDelay

```solidity
event NewDelay(uint256 newDelay)
```

### CancelTransaction

```solidity
event CancelTransaction(bytes32 txHash, address target, uint256 value, string signature, bytes data, uint256 eta)
```

### ExecuteTransaction

```solidity
event ExecuteTransaction(bytes32 txHash, address target, uint256 value, string signature, bytes data, uint256 eta)
```

### QueueTransaction

```solidity
event QueueTransaction(bytes32 txHash, address target, uint256 value, string signature, bytes data, uint256 eta)
```

### GRACE_PERIOD

```solidity
uint256 GRACE_PERIOD
```

### MINIMUM_DELAY

```solidity
uint256 MINIMUM_DELAY
```

### MAXIMUM_DELAY

```solidity
uint256 MAXIMUM_DELAY
```

### admin

```solidity
address admin
```

### pendingAdmin

```solidity
address pendingAdmin
```

### delay

```solidity
uint256 delay
```

### queuedTransactions

```solidity
mapping(bytes32 => bool) queuedTransactions
```

### constructor

```solidity
constructor(address admin_, uint256 delay_) public
```

### setDelay

```solidity
function setDelay(uint256 delay_) public
```

### acceptAdmin

```solidity
function acceptAdmin() public
```

### setPendingAdmin

```solidity
function setPendingAdmin(address pendingAdmin_) public
```

### queueTransaction

```solidity
function queueTransaction(address target, uint256 value, string signature, bytes data, uint256 eta) public returns (bytes32)
```

### cancelTransaction

```solidity
function cancelTransaction(address target, uint256 value, string signature, bytes data, uint256 eta) public
```

### executeTransaction

```solidity
function executeTransaction(address target, uint256 value, string signature, bytes data, uint256 eta) public payable returns (bytes)
```

### getBlockTimestamp

```solidity
function getBlockTimestamp() internal view returns (uint256)
```

### receive

```solidity
receive() external payable
```

### fallback

```solidity
fallback() external payable
```

## BalanceOfCompStrategy

### name

```solidity
function name() external pure returns (string)
```

### getPastVotes

```solidity
function getPastVotes(address ref, address account, uint256 blockNumber) external view returns (uint256)
```

## BalanceOfRatioStrategy

### name

```solidity
function name() external pure returns (string)
```

### getThreshold

```solidity
function getThreshold(address ref, uint256 thresholdParameter, uint256 blockNumber) external view returns (uint256)
```

## BalanceOfStrategy

### name

```solidity
function name() external pure virtual returns (string)
```

## BaseStrategy

### getThreshold

```solidity
function getThreshold(address ref, uint256 thresholdParameter, uint256 blockNumber) external view virtual returns (uint256)
```

### getPastVotes

```solidity
function getPastVotes(address ref, address account, uint256 blockNumber) external view virtual returns (uint256)
```

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

## IHotpotFactory

### TokenInfo

```solidity
struct TokenInfo {
  string tokenType;
  string bondingCurveType;
  string name;
  string symbol;
  string metadata;
  address projectAdmin;
  address projectTreasury;
  uint256 projectMintTax;
  uint256 projectBurnTax;
  bool isSbt;
  bytes data;
}
```

### deployToken

```solidity
function deployToken(struct IHotpotFactory.TokenInfo token) external payable
```

### createGovernorForToken

```solidity
function createGovernorForToken(address proxyAddr, struct GovernorLib.GovInfo token) external
```

### addBondingCurveImplement

```solidity
function addBondingCurveImplement(address impl) external
```

### updateHotpotImplement

```solidity
function updateHotpotImplement(string tokenType, address impl) external
```

### getHotpotImplement

```solidity
function getHotpotImplement(string tokenType) external view returns (address impl)
```

### getBondingCurveImplement

```solidity
function getBondingCurveImplement(string bondingCurveType) external view returns (address impl)
```

### setPlatformTaxRate

```solidity
function setPlatformTaxRate(uint256 platformMintTax, uint256 platformBurnTax) external
```

### getTaxRateOfPlatform

```solidity
function getTaxRateOfPlatform() external view returns (uint256 platformMintTax, uint256 platformBurnTax)
```

### getTokensLength

```solidity
function getTokensLength() external view returns (uint256 len)
```

### getToken

```solidity
function getToken(uint256 index) external view returns (address addr)
```

### getPlatformAdmin

```solidity
function getPlatformAdmin() external view returns (address)
```

### getPlatformTreasury

```solidity
function getPlatformTreasury() external view returns (address)
```

### declareDoomsday

```solidity
function declareDoomsday(address proxyAddress) external
```

### pause

```solidity
function pause(address proxyAddress) external
```

### unpause

```solidity
function unpause(address proxyAddress) external
```

### requestUpgrade

```solidity
function requestUpgrade(address proxyAddress, bytes data) external
```

### rejectUpgrade

```solidity
function rejectUpgrade(address proxyAddress, string reason) external
```

### upgradeTokenImplement

```solidity
function upgradeTokenImplement(address proxyAddress) external payable
```

### LogTokenDeployed

```solidity
event LogTokenDeployed(string tokenType, string bondingCurveType, uint256 tokenId, address deployedAddr)
```

### LogTokenUpgradeRequested

```solidity
event LogTokenUpgradeRequested(address proxyAddress, uint256 timelock, address implementAddr, address requester, bytes data)
```

### LogTokenUpgradeRejected

```solidity
event LogTokenUpgradeRejected(address proxyAddress, address rejecter, string reason)
```

### LogTokenImplementUpgraded

```solidity
event LogTokenImplementUpgraded(address proxyAddress, string tokenType, address implementAddr)
```

### LogTokenTypeImplAdded

```solidity
event LogTokenTypeImplAdded(string tokenType, address impl)
```

### LogBondingCurveTypeImplAdded

```solidity
event LogBondingCurveTypeImplAdded(string tokenType, address impl)
```

### LogPlatformAdminChanged

```solidity
event LogPlatformAdminChanged(address newAccount)
```

### LogPlatformTreasuryChanged

```solidity
event LogPlatformTreasuryChanged(address newAccount)
```

### LogPlatformTaxChanged

```solidity
event LogPlatformTaxChanged()
```

## IHotpotSwap

_Interface of the hotpot swap_

### mint

```solidity
function mint(address to, uint256) external payable returns (uint256)
```

### estimateMint

```solidity
function estimateMint(uint256 nativeAmount) external view returns (uint256 daoTokenAmount, uint256 nativeTokenPaidAmount, uint256 platformFee, uint256 projectFee)
```

### estimateMintNeed

```solidity
function estimateMintNeed(uint256 tokenAmountWant) external view returns (uint256 daoTokenAmount, uint256 nativeTokenPaidAmount, uint256 platformFee, uint256 projectFee)
```

### burn

```solidity
function burn(address to, uint256, uint256) external returns (uint256)
```

### estimateBurn

```solidity
function estimateBurn(uint256 tokenAmount) external view returns (uint256 daoTokenAmountNedd, uint256 nativeTokenPaidAmount, uint256 platformFee, uint256 projectFee)
```

## IHotpotToken

_Interface of the hotpot swap_

### initialize

```solidity
function initialize(address bondingCurveAddress, string name, string symbol, string metadata, address projectAdmin, address projectTreasury, uint256 projectMintTax, uint256 projectBurnTax, bool isSbt, bytes parameters, address factory) external
```

### setGov

```solidity
function setGov(address gov) external
```

### getProjectAdminRole

```solidity
function getProjectAdminRole() external pure returns (bytes32 role)
```

### setMetadata

```solidity
function setMetadata(string url) external
```

### getMetadata

```solidity
function getMetadata() external view returns (string)
```

### getTaxRateOfProject

```solidity
function getTaxRateOfProject() external view returns (uint256 projectMintRate, uint256 projectBurnRate)
```

### getTaxRateOfPlatform

```solidity
function getTaxRateOfPlatform() external view returns (uint256 platformMintTax, uint256 platformBurnTax)
```

### setProjectTaxRate

```solidity
function setProjectTaxRate(uint256 projectMintTax, uint256 projectBurnTax) external
```

### platform

```solidity
function platform() external view returns (address)
```

### treasury

```solidity
function treasury() external view returns (address)
```

### cap

```solidity
function cap() external view returns (uint256 cap)
```

### getFactory

```solidity
function getFactory() external view returns (address)
```

### getProjectAdmin

```solidity
function getProjectAdmin() external view returns (address)
```

### getProjectTreasury

```solidity
function getProjectTreasury() external view returns (address)
```

### setProjectAdmin

```solidity
function setProjectAdmin(address newProjectAdmin) external
```

### setProjectTreasury

```solidity
function setProjectTreasury(address newProjectTreasury) external
```

### price

```solidity
function price() external view returns (uint256)
```

### mint

```solidity
function mint(address to, uint256 minDaoTokenRecievedAmount) external payable returns (uint256)
```

### estimateMint

```solidity
function estimateMint(uint256 nativeTokenPaidAmount) external view returns (uint256 daoTokenAmount, uint256, uint256 platformFee, uint256 projectFee)
```

### burn

```solidity
function burn(address to, uint256 daoTokenPaidAmount, uint256 minNativeTokenRecievedAmount) external payable returns (uint256)
```

### estimateBurn

```solidity
function estimateBurn(uint256 daoTokenAmount) external view returns (uint256, uint256 nativeTokenAmount, uint256 platformFee, uint256 projectFee)
```

### pause

```solidity
function pause() external
```

### unpause

```solidity
function unpause() external
```

### destroyForDoomsday

```solidity
function destroyForDoomsday() external
```

### declareDoomsday

```solidity
function declareDoomsday() external
```

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

## ABDKMath64x64

Smart contract library of mathematical functions operating with signed
64.64-bit fixed point numbers.  Signed 64.64-bit fixed point number is
basically a simple fraction whose numerator is signed 128-bit integer and
denominator is 2^64.  As long as denominator is always the same, there is no
need to store it, thus in Solidity signed 64.64-bit fixed point numbers are
represented by int128 type holding only the numerator.

### fromInt

```solidity
function fromInt(int256 x) internal pure returns (int128)
```

Convert signed 256-bit integer number into signed 64.64-bit fixed point
number.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int256 | signed 256-bit integer number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### toInt

```solidity
function toInt(int128 x) internal pure returns (int64)
```

Convert signed 64.64 fixed point number into signed 64-bit integer number
rounding down.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int64 | signed 64-bit integer number |

### fromUInt

```solidity
function fromUInt(uint256 x) internal pure returns (int128)
```

Convert unsigned 256-bit integer number into signed 64.64-bit fixed point
number.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | uint256 | unsigned 256-bit integer number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### toUInt

```solidity
function toUInt(int128 x) internal pure returns (uint64)
```

Convert signed 64.64 fixed point number into unsigned 64-bit integer
number rounding down.  Revert on underflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint64 | unsigned 64-bit integer number |

### from128x128

```solidity
function from128x128(int256 x) internal pure returns (int128)
```

Convert signed 128.128 fixed point number into signed 64.64-bit fixed point
number rounding down.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int256 | signed 128.128-bin fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### to128x128

```solidity
function to128x128(int128 x) internal pure returns (int256)
```

Convert signed 64.64 fixed point number into signed 128.128 fixed point
number.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int256 | signed 128.128 fixed point number |

### add

```solidity
function add(int128 x, int128 y) internal pure returns (int128)
```

Calculate x + y.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |
| y | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### sub

```solidity
function sub(int128 x, int128 y) internal pure returns (int128)
```

Calculate x - y.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |
| y | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### mul

```solidity
function mul(int128 x, int128 y) internal pure returns (int128)
```

Calculate x * y rounding down.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |
| y | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### muli

```solidity
function muli(int128 x, int256 y) internal pure returns (int256)
```

Calculate x * y rounding towards zero, where x is signed 64.64 fixed point
number and y is signed 256-bit integer number.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64 fixed point number |
| y | int256 | signed 256-bit integer number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int256 | signed 256-bit integer number |

### mulu

```solidity
function mulu(int128 x, uint256 y) internal pure returns (uint256)
```

Calculate x * y rounding down, where x is signed 64.64 fixed point number
and y is unsigned 256-bit integer number.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64 fixed point number |
| y | uint256 | unsigned 256-bit integer number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | unsigned 256-bit integer number |

### div

```solidity
function div(int128 x, int128 y) internal pure returns (int128)
```

Calculate x / y rounding towards zero.  Revert on overflow or when y is
zero.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |
| y | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### divi

```solidity
function divi(int256 x, int256 y) internal pure returns (int128)
```

Calculate x / y rounding towards zero, where x and y are signed 256-bit
integer numbers.  Revert on overflow or when y is zero.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int256 | signed 256-bit integer number |
| y | int256 | signed 256-bit integer number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### divu

```solidity
function divu(uint256 x, uint256 y) internal pure returns (int128)
```

Calculate x / y rounding towards zero, where x and y are unsigned 256-bit
integer numbers.  Revert on overflow or when y is zero.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | uint256 | unsigned 256-bit integer number |
| y | uint256 | unsigned 256-bit integer number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### neg

```solidity
function neg(int128 x) internal pure returns (int128)
```

Calculate -x.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### abs

```solidity
function abs(int128 x) internal pure returns (int128)
```

Calculate |x|.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### inv

```solidity
function inv(int128 x) internal pure returns (int128)
```

Calculate 1 / x rounding towards zero.  Revert on overflow or when x is
zero.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### avg

```solidity
function avg(int128 x, int128 y) internal pure returns (int128)
```

Calculate arithmetics average of x and y, i.e. (x + y) / 2 rounding down.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |
| y | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### gavg

```solidity
function gavg(int128 x, int128 y) internal pure returns (int128)
```

Calculate geometric average of x and y, i.e. sqrt (x * y) rounding down.
Revert on overflow or in case x * y is negative.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |
| y | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### pow

```solidity
function pow(int128 x, uint256 y) internal pure returns (int128)
```

Calculate x^y assuming 0^0 is 1, where x is signed 64.64 fixed point number
and y is unsigned 256-bit integer number.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |
| y | uint256 | uint256 value |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### sqrt

```solidity
function sqrt(int128 x) internal pure returns (int128)
```

Calculate sqrt (x) rounding down.  Revert if x < 0.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### log_2

```solidity
function log_2(int128 x) internal pure returns (int128)
```

Calculate binary logarithm of x.  Revert if x <= 0.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### ln

```solidity
function ln(int128 x) internal pure returns (int128)
```

Calculate natural logarithm of x.  Revert if x <= 0.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### exp_2

```solidity
function exp_2(int128 x) internal pure returns (int128)
```

Calculate binary exponent of x.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

### exp

```solidity
function exp(int128 x) internal pure returns (int128)
```

Calculate natural exponent of x.  Revert on overflow.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| x | int128 | signed 64.64-bit fixed point number |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int128 | signed 64.64-bit fixed point number |

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

## HotpotERC721Mixed

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

### totalSupply

```solidity
function totalSupply() public view returns (uint256)
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

### estimateMintNeed

```solidity
function estimateMintNeed(uint256 tokenAmountWant) external view returns (uint256 daoTokenAmount, uint256 nativeTokenPaidAmount, uint256 platformFee, uint256 projectFee)
```

### burn

```solidity
function burn(address to, uint256 tokenId, uint256 minNativeTokenRecievedAmount) public returns (uint256)
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
function _beforeTokenTransfer(address from, address to, uint256, uint256 amount) internal virtual
```

### _baseURI

```solidity
function _baseURI() internal view returns (string)
```

_Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, can be overridden in child contracts._

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

## TestErc20

### constructor

```solidity
constructor() public
```

