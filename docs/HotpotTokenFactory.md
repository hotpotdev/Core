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
function deployToken(struct IHotpotFactory.TokenInfo token, uint256 mintfirstAmount) public payable
```

Deploy a new token with the specified `TokenInfo`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | struct IHotpotFactory.TokenInfo | The information of the token to be deployed |
| mintfirstAmount | uint256 | The first amount of the token to be minted. |

### createGovernorForToken

```solidity
function createGovernorForToken(address proxyAddr, struct GovernorLib.GovInfo govInfo) public
```

### setPlatformTaxRate

```solidity
function setPlatformTaxRate(uint256 platformMintTax, uint256 platformBurnTax) public
```

Set the platform's tax rate for minting and burning tokens.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| platformMintTax | uint256 | the platform's tax rate for minting tokens. |
| platformBurnTax | uint256 | the platform's tax rate for burning tokens. |

### getTaxRateOfPlatform

```solidity
function getTaxRateOfPlatform() public view returns (uint256 platformMintTax, uint256 platformBurnTax)
```

Retrieve the platform's tax rate for minting and burning tokens.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| platformMintTax | uint256 | the platform's tax rate for minting tokens. |
| platformBurnTax | uint256 | the platform's tax rate for burning tokens. |

### addBondingCurveImplement

```solidity
function addBondingCurveImplement(address impl) public
```

Add an implementation of a bonding curve type to the Hotpot platform.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| impl | address | the implementation address to be added. |

### getBondingCurveImplement

```solidity
function getBondingCurveImplement(string bondingCurveType) public view returns (address impl)
```

Retrieve the implementation of a specified bonding curve type.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| bondingCurveType | string | the type of bonding curve |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| impl | address | the implementation address. |

### updateHotpotImplement

```solidity
function updateHotpotImplement(string tokenType, address impl) public
```

Updates the implementation of a Hotpot token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenType | string | the type of token |
| impl | address | updates the implementation of the Hotpot. |

### getHotpotImplement

```solidity
function getHotpotImplement(string tokenType) public view returns (address impl)
```

Retrieve the implementation of a specified token type from the Hotpot platform.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenType | string | the type of token |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| impl | address | the implementation address. |

### getTokensLength

```solidity
function getTokensLength() public view returns (uint256 len)
```

Get the number of tokens deployed on the Hotpot platform.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| len | uint256 | the number of tokens. |

### getToken

```solidity
function getToken(uint256 index) public view returns (address addr)
```

Get the address of a deployed token by its index.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 | the index of the token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| addr | address | the address of the deployed token. |

### getPlatformAdmin

```solidity
function getPlatformAdmin() public view returns (address)
```

Get the address of the platform administrator.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | the address of the platform administrator. |

### getPlatformTreasury

```solidity
function getPlatformTreasury() public view returns (address)
```

Get the address of the platform treasury.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | the address of the platform treasury. |

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

Declare a doomsday event for a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proxyAddress | address | the address of the token's proxy. |

### pause

```solidity
function pause(address proxyAddress) external
```

Pause a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proxyAddress | address | the address of the token's proxy. |

### unpause

```solidity
function unpause(address proxyAddress) external
```

Unpause a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proxyAddress | address | the address of the token's proxy. |

### requestUpgrade

```solidity
function requestUpgrade(address proxyAddress, bytes data) external
```

Request an upgrade for a token's implementation.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proxyAddress | address | the address of the token's proxy. |
| data | bytes | additional data for the upgrade request. |

### rejectUpgrade

```solidity
function rejectUpgrade(address proxyAddress, string reason) external
```

Reject an upgrade request for a token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proxyAddress | address | the address of the token's proxy. |
| reason | string | the reason for rejection. |

### upgradeTokenImplement

```solidity
function upgradeTokenImplement(address proxyAddress) external payable
```

when the upgrade requested, admin can upgrade the implement of token after 2 days

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proxyAddress | address | the proxy address of token |

