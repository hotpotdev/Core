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

