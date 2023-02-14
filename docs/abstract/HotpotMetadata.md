# Solidity API

## HotpotMetadata

### _setMetadata

```solidity
function _setMetadata(string uri) internal
```

### getMetadata

```solidity
function getMetadata() public view virtual returns (string)
```

_Returns the metadata URL for the token._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | Metadata URL for the token. |

### LogMetadataChanged

```solidity
event LogMetadataChanged()
```

