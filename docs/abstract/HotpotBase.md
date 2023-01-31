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

