import { expect } from "chai"
import { ethers, network } from "hardhat"
import { ExpMixedHotpotToken__factory } from "../../typechain"

const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')

// 验证算子正确性，单次铸造并单次销毁
// mining(uint256 nativeTokens, uint256 erc20Supply)
// burning(uint256 erc20Tokens, uint256 erc20Supply)
describe("验证 Mint Cap 铸造限制", async () => {
    let calculatorContract = "ExpMixedBondingSwap"
    let hotpotContract = "ExpHotpotTokenFactory"

    describe('Exp Mixed Hotpot Token', async () => {
        it("校验 mint 方法 铸造上限", async () => {
            let signers = await ethers.getSigners()
            let buyer = signers[0]
            let treasury = signers[1]
            let platform = signers[2]
            const HotpotToken = await ethers.getContractFactory(hotpotContract)
            await network.provider.send("hardhat_setBalance", [buyer.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])
            let mintRate = 500
            let burnRate = 1000
            const erc20 = await HotpotToken.deploy('test', 'test', treasury.address, mintRate, burnRate, platform.address,false,Ether.mul('50000'))
            await erc20.deployed()
            const hotpotTokenAbi = ExpMixedHotpotToken__factory.connect(erc20.address,erc20.signer)
            let price = await hotpotTokenAbi.price();
            // mint 1 eth
            expect(hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: price }),'铸造量少于 mintCap 时需要铸造成功').to.any
            expect(hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: price.mul(50000) }), '铸造量大于 mintCap 时需要铸造失败').to.reverted
        })
    })
})
