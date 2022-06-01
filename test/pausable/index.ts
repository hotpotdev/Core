import { expect } from "chai"
import { ethers, network } from "hardhat"
import { ExpMixedHotpotToken__factory } from "../../typechain"

const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')
const hre=require("hardhat")

describe("验证 Pausable 暂停功能", async () => {

    describe('Exp Mixed Hotpot Token', async () => {
        it("校验 pause 功能", async () => {
            await hre.network.provider.send("hardhat_reset")
            let signers = await ethers.getSigners()
            let buyer = signers[0]
            await network.provider.send("hardhat_setBalance", [buyer.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])
            await network.provider.send("hardhat_setBalance", [hre.treasury.address, Ether._hex.replace(/0x0+/, '0x')])
            await network.provider.send("hardhat_setBalance", [hre.platform.address, Ether._hex.replace(/0x0+/, '0x')])
            const token = await hre.expToken(500,1000)
            const hotpotTokenAbi = await ExpMixedHotpotToken__factory.connect(token.address,buyer)

            let tx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)})
            await tx1.wait()

            await expect(hre.factory.connect(buyer).pause(hotpotTokenAbi.address),'非 platform 用户不可调用 pause 功能').to.reverted
            await expect(hre.factory.connect(buyer).unpause(hotpotTokenAbi.address),'非 platform 用户不可调用 unpause 功能').to.reverted
            
            expect(await hotpotTokenAbi.connect(buyer).paused(),'pause 前 paused 应当为 false').to.false
            // await expect(hotpotTokenAbi.connect(treasury).pause().then(async tx=>{ await tx.wait()}),'treasury 用户需要调用 pause 功能成功').to.ok
            let tx2 = await hre.factory.connect(hre.platform).pause(hotpotTokenAbi.address)
            await tx2.wait();
            
            expect(await hotpotTokenAbi.paused(),'pause 后 paused 应当为 true').to.true

            let erc20Balance = await hotpotTokenAbi.balanceOf(buyer.address)
            await expect(hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)}),'暂停后 不能mint').to.reverted
            await expect(hotpotTokenAbi.connect(buyer).burn(buyer.address,erc20Balance),'暂停后 不能burn').to.reverted
            await expect(hotpotTokenAbi.connect(buyer).transfer(buyer.address,erc20Balance),'暂停后 不能transfer').to.reverted

            let tx3 = await hre.factory.connect(hre.platform).unpause(hotpotTokenAbi.address)
            await tx3.wait()

            expect(await hotpotTokenAbi.paused(),'unpause 后 paused 应当为 false').to.false

            await expect(hotpotTokenAbi.connect(buyer).transfer(hre.treasury.address,'100'),'取消暂停后 可以转账').to.ok

            await expect(hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)}),'取消暂停后 可以铸造').to.ok
            
            await expect(hotpotTokenAbi.connect(buyer).burn(buyer.address,erc20Balance.div(2)),'取消暂停后 可以销毁').to.ok

        })
    })
})
