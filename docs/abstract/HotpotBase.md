# Solidity API

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

### _raisingToken

```solidity
address _raisingToken
```

### whenNotPaused

```solidity
modifier whenNotPaused()
```

### initialize

```solidity
function initialize(address bondingCurveAddress, string name, string symbol, string metadata, address projectAdmin, address projectTreasury, uint256 projectMintTax, uint256 projectBurnTax, bool isSbt, address raisingTokenAddr, bytes parameters, address factory) public virtual
```

_Initializes the hotpot token contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| bondingCurveAddress | address | Address of the bonding curve contract. |
| name | string | Name of the token. |
| symbol | string | Symbol of the token. |
| metadata | string | Metadata URL for the token. |
| projectAdmin | address | Address of the project administrator. |
| projectTreasury | address | Address of the project treasury. |
| projectMintTax | uint256 | Tax rate for project token minting. |
| projectBurnTax | uint256 | Tax rate for project token burning. |
| isSbt | bool | Flag indicating whether the token is a SBT. |
| raisingTokenAddr | address | Address of the raising token. |
| parameters | bytes | Parameters for the bonding curve contract. |
| factory | address | Address of the factory contract. |

### getProjectAdminRole

```solidity
function getProjectAdminRole() external pure returns (bytes32 role)
```

_Returns the role identifier for the project administrator._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| role | bytes32 | identifier for the project administrator. |

### doomsday

```solidity
function doomsday() public view returns (bool)
```

### getFactory

```solidity
function getFactory() public view returns (address)
```

_Gets the factory contract address_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Address of the factory contract |

### getProjectAdmin

```solidity
function getProjectAdmin() public view returns (address)
```

_Get the current project admin address_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | projectAdmin address |

### getProjectTreasury

```solidity
function getProjectTreasury() public view returns (address)
```

_Get the current project treasury address_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | projectTreasury address |

### getRaisingToken

```solidity
function getRaisingToken() public view returns (address)
```

_Gets the raising token address_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Address of the raising token |

### setMetadata

```solidity
function setMetadata(string url) public
```

_Sets the metadata URL for the token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| url | string | Metadata URL for the token. |

### paused

```solidity
function paused() public view returns (bool)
```

### pause

```solidity
function pause() public
```

@dev Pauses the hotpot token contract

### unpause

```solidity
function unpause() public
```

@dev Unpauses the hotpot token contract

### declareDoomsday

```solidity
function declareDoomsday() public
```

@dev Declares doomsday scenario for the hotpot token contract

### setProjectAdmin

```solidity
function setProjectAdmin(address newProjectAdmin) public
```

_Set a new address as project admin_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newProjectAdmin | address | new address to be set as project admin |

### setGov

```solidity
function setGov(address gov) public
```

_Sets the address of the governance contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| gov | address | Address of the governance contract. |

### setProjectTreasury

```solidity
function setProjectTreasury(address newProjectTreasury) public
```

_Set a new address as project treasury_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newProjectTreasury | address | new address to be set as project treasury |

### destroyForDoomsday

```solidity
function destroyForDoomsday() public
```

@dev Destroys the hotpot token contract for doomsday scenario

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

### _setProjectTaxRate

```solidity
function _setProjectTaxRate(uint256 projectMintTax, uint256 projectBurnTax) internal
```

### setProjectTaxRate

```solidity
function setProjectTaxRate(uint256 projectMintTax, uint256 projectBurnTax) public
```

_Sets the tax rates for project token minting and burning._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| projectMintTax | uint256 | Tax rate for project when token minting. |
| projectBurnTax | uint256 | Tax rate for project when token burning. |

### getTaxRateOfProject

```solidity
function getTaxRateOfProject() public view returns (uint256 projectMintTax, uint256 projectBurnTax)
```

_Returns the tax rates for project token minting and burning._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| projectMintTax | uint256 |  |
| projectBurnTax | uint256 |  |

### getTaxRateOfPlatform

```solidity
function getTaxRateOfPlatform() public view returns (uint256 platformMintTax, uint256 platformBurnTax)
```

_Returns the tax rates for platform token minting and burning._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| platformMintTax | uint256 | Tax rate for platform when token minting |
| platformBurnTax | uint256 | Tax rate for platform when token burning. |

### mint

```solidity
function mint(address to, uint256 payAmount, uint256 minReceive) public payable virtual
```

_Mint new tokens_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | the address where the new tokens will be sent to |
| payAmount | uint256 | the amount of raising token to pay |
| minReceive | uint256 | the minimum amount of tokens the buyer wants to receive |

### estimateMint

```solidity
function estimateMint(uint256 payAmount) public view virtual returns (uint256 receivedAmount, uint256 paidAmount, uint256 platformFee, uint256 projectFee)
```

_Estimate the amount of tokens that will be received from minting, the amount of raising token that will be paid, and the platform and project fees_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| payAmount | uint256 | the amount of raising token to pay |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| receivedAmount | uint256 | the estimated amount of tokens received |
| paidAmount | uint256 | the estimated amount of raising token paid |
| platformFee | uint256 | the estimated platform fee |
| projectFee | uint256 | the estimated project fee |

### estimateMintNeed

```solidity
function estimateMintNeed(uint256 tokenAmountWant) public view virtual returns (uint256 receivedAmount, uint256 paidAmount, uint256 platformFee, uint256 projectFee)
```

_Estimate the amount of raising token that needs to be paid to receive a specific amount of tokens, and the platform and project fees_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAmountWant | uint256 | the desired amount of tokens |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| receivedAmount | uint256 | the estimated amount of tokens received |
| paidAmount | uint256 | the estimated amount of raising token paid |
| platformFee | uint256 | the estimated platform fee |
| projectFee | uint256 | the estimated project fee |

### burn

```solidity
function burn(address to, uint256 payAmount, uint256 minReceive) public payable virtual
```

_Burn tokens to receive raising token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | the address where the raising token will be sent to |
| payAmount | uint256 | the amount of tokens to burn |
| minReceive | uint256 | the minimum amount of raising token the seller wants to receive |

### estimateBurn

```solidity
function estimateBurn(uint256 tokenAmount) public view virtual returns (uint256 amountNeed, uint256 amountReturn, uint256 platformFee, uint256 projectFee)
```

_Estimate the amount of raising token that will be received from burning tokens, the amount of tokens that need to be burned, and the platform and project fees_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAmount | uint256 | the amount of tokens to burn |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountNeed | uint256 | the estimated amount of tokens needed to be burned |
| amountReturn | uint256 | the estimated amount of raising token received |
| platformFee | uint256 | the estimated platform fee |
| projectFee | uint256 | the estimated project fee |

### price

```solidity
function price() public view returns (uint256)
```

_Get the current token price_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | token price |

### _transferFromInternal

```solidity
function _transferFromInternal(address account, uint256 amount) internal virtual
```

### _transferInternal

```solidity
function _transferInternal(address account, uint256 amount) internal virtual
```

### _mintInternal

```solidity
function _mintInternal(address account, uint256 amount) internal virtual
```

### _burnInternal

```solidity
function _burnInternal(address account, uint256 amount) internal virtual
```

### _getCurrentSupply

```solidity
function _getCurrentSupply() internal view virtual returns (uint256)
```

### _afterMint

```solidity
function _afterMint(address account) internal virtual
```

### LogProjectTaxChanged

```solidity
event LogProjectTaxChanged()
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

### LogMint

```solidity
event LogMint(address to, uint256 daoTokenAmount, uint256 lockAmount, uint256 platformFee, uint256 projectFee)
```

### LogBurned

```solidity
event LogBurned(address from, uint256 daoTokenAmount, uint256 returnAmount, uint256 platformFee, uint256 projectFee)
```

### fallback

```solidity
fallback() external
```

