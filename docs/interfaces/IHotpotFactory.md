# Solidity API

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
  address raisingTokenAddr;
  bytes data;
}
```

### deployToken

```solidity
function deployToken(struct IHotpotFactory.TokenInfo token, uint256 mintfirstAmount) external payable
```

Deploy a new token with the specified `TokenInfo`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | struct IHotpotFactory.TokenInfo | The information of the token to be deployed |
| mintfirstAmount | uint256 | The first amount of the token to be minted. |

### createGovernorForToken

```solidity
function createGovernorForToken(address proxyAddr, struct GovernorLib.GovInfo token) external
```

Creates a governor for a token with the specified information.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proxyAddr | address | the proxy address of the token |
| token | struct GovernorLib.GovInfo | the token information in the form of a GovernorLib.GovInfo struct. |

### addBondingCurveImplement

```solidity
function addBondingCurveImplement(address impl) external
```

Add an implementation of a bonding curve type to the Hotpot platform.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| impl | address | the implementation address to be added. |

### updateHotpotImplement

```solidity
function updateHotpotImplement(string tokenType, address impl) external
```

Updates the implementation of a Hotpot token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenType | string | the type of token |
| impl | address | updates the implementation of the Hotpot. |

### getHotpotImplement

```solidity
function getHotpotImplement(string tokenType) external view returns (address impl)
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

### getBondingCurveImplement

```solidity
function getBondingCurveImplement(string bondingCurveType) external view returns (address impl)
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

### setPlatformTaxRate

```solidity
function setPlatformTaxRate(uint256 platformMintTax, uint256 platformBurnTax) external
```

Set the platform's tax rate for minting and burning tokens.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| platformMintTax | uint256 | the platform's tax rate for minting tokens. |
| platformBurnTax | uint256 | the platform's tax rate for burning tokens. |

### getTaxRateOfPlatform

```solidity
function getTaxRateOfPlatform() external view returns (uint256 platformMintTax, uint256 platformBurnTax)
```

Retrieve the platform's tax rate for minting and burning tokens.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| platformMintTax | uint256 | the platform's tax rate for minting tokens. |
| platformBurnTax | uint256 | the platform's tax rate for burning tokens. |

### getTokensLength

```solidity
function getTokensLength() external view returns (uint256 len)
```

Get the number of tokens deployed on the Hotpot platform.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| len | uint256 | the number of tokens. |

### getToken

```solidity
function getToken(uint256 index) external view returns (address addr)
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
function getPlatformAdmin() external view returns (address)
```

Get the address of the platform administrator.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | the address of the platform administrator. |

### getPlatformTreasury

```solidity
function getPlatformTreasury() external view returns (address)
```

Get the address of the platform treasury.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | the address of the platform treasury. |

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

Upgrade a token's implementation.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| proxyAddress | address | the address of the token's proxy. |

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

