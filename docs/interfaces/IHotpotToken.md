# Solidity API

## IHotpotToken

_Interface of the hotpot swap_

### initialize

```solidity
function initialize(address bondingCurveAddress, string name, string symbol, string metadata, address projectAdmin, address projectTreasury, uint256 projectMintTax, uint256 projectBurnTax, bool isSbt, address raisingTokenAddr, bytes parameters, address factory) external
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

### setGov

```solidity
function setGov(address gov) external
```

_Sets the address of the governance contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| gov | address | Address of the governance contract. |

### getProjectAdminRole

```solidity
function getProjectAdminRole() external pure returns (bytes32 role)
```

_Returns the role identifier for the project administrator._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| role | bytes32 | identifier for the project administrator. |

### setMetadata

```solidity
function setMetadata(string url) external
```

_Sets the metadata URL for the token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| url | string | Metadata URL for the token. |

### getMetadata

```solidity
function getMetadata() external view returns (string)
```

_Returns the metadata URL for the token._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | Metadata URL for the token. |

### getTaxRateOfProject

```solidity
function getTaxRateOfProject() external view returns (uint256 projectMintRate, uint256 projectBurnRate)
```

_Returns the tax rates for project token minting and burning._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| projectMintRate | uint256 | Tax rate for project token minting |
| projectBurnRate | uint256 | Tax rate for project token burning. |

### getTaxRateOfPlatform

```solidity
function getTaxRateOfPlatform() external view returns (uint256 platformMintTax, uint256 platformBurnTax)
```

_Returns the tax rates for platform token minting and burning._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| platformMintTax | uint256 | Tax rate for platform when token minting |
| platformBurnTax | uint256 | Tax rate for platform when token burning. |

### setProjectTaxRate

```solidity
function setProjectTaxRate(uint256 projectMintTax, uint256 projectBurnTax) external
```

_Sets the tax rates for project token minting and burning._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| projectMintTax | uint256 | Tax rate for project when token minting. |
| projectBurnTax | uint256 | Tax rate for project when token burning. |

### getFactory

```solidity
function getFactory() external view returns (address)
```

_Gets the factory contract address_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Address of the factory contract |

### getRaisingToken

```solidity
function getRaisingToken() external view returns (address)
```

_Gets the raising token address_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Address of the raising token |

### getProjectAdmin

```solidity
function getProjectAdmin() external view returns (address)
```

_Get the current project admin address_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | projectAdmin address |

### setProjectAdmin

```solidity
function setProjectAdmin(address newProjectAdmin) external
```

_Set a new address as project admin_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newProjectAdmin | address | new address to be set as project admin |

### getProjectTreasury

```solidity
function getProjectTreasury() external view returns (address)
```

_Get the current project treasury address_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | projectTreasury address |

### setProjectTreasury

```solidity
function setProjectTreasury(address newProjectTreasury) external
```

_Set a new address as project treasury_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newProjectTreasury | address | new address to be set as project treasury |

### price

```solidity
function price() external view returns (uint256)
```

_Get the current token price_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | token price |

### mint

```solidity
function mint(address to, uint256 payAmount, uint256 minReceive) external payable
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
function estimateMint(uint256 payAmount) external view returns (uint256 receivedAmount, uint256 paidAmount, uint256 platformFee, uint256 projectFee)
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
function estimateMintNeed(uint256 tokenAmountWant) external view returns (uint256 receivedAmount, uint256 paidAmount, uint256 platformFee, uint256 projectFee)
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
function burn(address to, uint256 payAmount, uint256 minReceive) external payable
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
function estimateBurn(uint256 tokenAmount) external view returns (uint256 amountNeed, uint256 amountReturn, uint256 platformFee, uint256 projectFee)
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

### pause

```solidity
function pause() external
```

@dev Pauses the hotpot token contract

### unpause

```solidity
function unpause() external
```

@dev Unpauses the hotpot token contract

### destroyForDoomsday

```solidity
function destroyForDoomsday() external
```

@dev Destroys the hotpot token contract for doomsday scenario

### declareDoomsday

```solidity
function declareDoomsday() external
```

@dev Declares doomsday scenario for the hotpot token contract

