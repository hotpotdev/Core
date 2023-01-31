# Solidity API

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

