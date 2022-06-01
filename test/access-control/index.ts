import { expect } from "chai"
import { ethers, network } from "hardhat"
import { ExpMixedHotpotToken__factory } from "../../typechain"

const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')
const hre=require("hardhat")

describe("验证 Factory 权限", async () => {

    describe('Mixed Hotpot Token', async () => {
        it("校验 权限 管理", async () => {
            
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

            expect(await hotpotTokenAbi.hasRole(await hotpotTokenAbi.FACTORY_ROLE(),hre.factory.address),'工厂 拥有 Factory 权限').to.true
            expect(await hotpotTokenAbi.hasRole(await hotpotTokenAbi.PROJECT_ADMIN_ROLE(),hre.factory.address),'工厂 不拥有 项目管理员 权限').to.false
            expect(await hotpotTokenAbi.hasRole(await hotpotTokenAbi.PROJECT_MANAGER_ROLE(),hre.factory.address),'工厂 不拥有 项目经理 权限').to.false
            
            expect(await hotpotTokenAbi.hasRole(await hotpotTokenAbi.PROJECT_ADMIN_ROLE(),hre.treasury.address),'Treaury 拥有 Project Admin权限').to.true
            expect(await hotpotTokenAbi.hasRole(await hotpotTokenAbi.PROJECT_ADMIN_ROLE(),hre.treasury.address),'Treaury 拥有 Project Manager权限').to.true
            expect(await hotpotTokenAbi.hasRole(await hotpotTokenAbi.FACTORY_ROLE(),hre.treasury.address),'Treaury 不拥有 Factory 权限').to.false

            await expect(hotpotTokenAbi.connect(treasury).grantRole(await hotpotTokenAbi.FACTORY_ROLE(),premintRole.address),"工厂权限 不可被授权").to.reverted
            await expect(hotpotTokenAbi.connect(treasury).grantRole(await hotpotTokenAbi.PROJECT_ADMIN_ROLE(),premintRole.address),"ProjectAdmin 权限 不可被授权").to.reverted
            await expect(hotpotTokenAbi.connect(treasury).grantRole(await hotpotTokenAbi.PROJECT_MANAGER_ROLE(),premintRole.address),"ProjectManager 权限 可被 TreasuryAdmin 授权").to.ok
            expect(await hotpotTokenAbi.hasRole(await hotpotTokenAbi.PROJECT_MANAGER_ROLE(),premintRole.address),'授权 后拥有了 ProjectManager 权限').to.true
            await expect(hotpotTokenAbi.connect(platform).revokeRole(await hotpotTokenAbi.PROJECT_MANAGER_ROLE(),premintRole.address),"ProjectManager 权限 不可被 非Treasury 撤销").to.reverted
            await expect(hotpotTokenAbi.connect(treasury).revokeRole(await hotpotTokenAbi.PROJECT_MANAGER_ROLE(),premintRole.address),"ProjectManager 权限 可被 Treasury 撤销").to.ok
            expect(await hotpotTokenAbi.hasRole(await hotpotTokenAbi.PROJECT_MANAGER_ROLE(),premintRole.address),'撤销授权 后不再有 ProjectManager 权限').to.false
        })
    })
})
