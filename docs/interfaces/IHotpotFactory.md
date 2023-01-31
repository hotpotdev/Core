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

