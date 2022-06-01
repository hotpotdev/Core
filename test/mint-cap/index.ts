import { expect } from "chai"
import { ethers, network } from "hardhat"

const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')
const hre = require("hardhat");

describe("验证 Mint Cap 铸造限制", async () => {

    describe('Exp Mixed Hotpot Token', async () => {
        it("校验 mint 方法 铸造上限", async () => {
            await hre.network.provider.send("hardhat_reset")
            let signers = await ethers.getSigners()
            let buyer = signers[0]
            await network.provider.send("hardhat_setBalance", [buyer.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])
            const hotpotTokenAbi = await hre.expToken(500, 1000,false,Ether.mul(10000))
            let price = await hotpotTokenAbi.price();
            // mint 1 eth
            await expect(hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: price }),'铸造量少于 mintCap 时需要铸造成功').to.ok
            await expect(hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: price.mul(100000) }), '铸造量大于 mintCap 时需要铸造失败').to.reverted
        })
    })
})
