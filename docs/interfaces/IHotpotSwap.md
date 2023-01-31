# Solidity API

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

