import { expect } from "chai"
import { ethers, network } from "hardhat"
import { ExpMixedHotpotToken__factory } from "../../typechain"

const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')
const hre=require("hardhat")

describe("验证 Token Premint 功能", async () => {

    describe('Mixed Hotpot Token', async () => {
        it("校验 premint 功能", async () => {
            await hre.network.provider.send("hardhat_reset")
            let signers = await ethers.getSigners()
            let buyer = signers[0]
            let treasury = hre.treasury
            let platform = hre.platform
            let premintRole = signers[5]
            await network.provider.send("hardhat_setBalance", [buyer.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])
            await network.provider.send("hardhat_setBalance", [hre.treasury.address, Ether._hex.replace(/0x0+/, '0x')])
            await network.provider.send("hardhat_setBalance", [hre.platform.address, Ether._hex.replace(/0x0+/, '0x')])
            const token = await hre.expToken(500,1000,true)
            const hotpotTokenAbi = await ExpMixedHotpotToken__factory.connect(token.address,buyer)

            await expect(hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)}),'非 Premint 用户不可 进行预铸造').to.reverted
            await expect(hotpotTokenAbi.connect(premintRole).mint(buyer.address,0,{value: Ether.mul(10)}),'非 Premint 用户不可 进行预铸造').to.reverted
            await expect(hotpotTokenAbi.connect(treasury).mint(treasury.address,0,{value: Ether.mul(10)}),' treasury 用户默认可以 预铸造').to.ok

            let tx1 = await hotpotTokenAbi.connect(treasury).grantRole(await hotpotTokenAbi.PREMINT_ROLE(),premintRole.address)
            await tx1.wait()
            await expect(hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)}),'非 Premint 用户不可 进行预铸造').to.reverted
            await expect(hotpotTokenAbi.connect(premintRole).mint(buyer.address,0,{value: Ether.mul(10)}),'Premint 授权后可 进行预铸造').to.ok
            
            let tx2 = await hotpotTokenAbi.connect(treasury).revokeRole(await hotpotTokenAbi.PREMINT_ROLE(),premintRole.address)
            await tx2.wait()
            await expect(hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)}),'非 Premint 用户不可 进行预铸造').to.reverted
            await expect(hotpotTokenAbi.connect(premintRole).mint(buyer.address,0,{value: Ether.mul(10)}),'撤销授权 Premint 后用户不可 进行预铸造').to.reverted

            let tx3 = await hotpotTokenAbi.connect(treasury).normalizeMint()
            await tx3.wait()
            await expect(hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)}),'非 Premint 用户不可 进行预铸造').to.ok
            await expect(hotpotTokenAbi.connect(premintRole).mint(buyer.address,0,{value: Ether.mul(10)}),'撤销授权 Premint 后用户不可 进行预铸造').to.ok
        })
    })
})
