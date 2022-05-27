import { expect } from "chai"
import { ethers, network } from "hardhat"

const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')
const hre=require("hardhat")
// 验证算子正确性，单次铸造并单次销毁
// mining(uint256 nativeTokens, uint256 erc20Supply)
// burning(uint256 erc20Tokens, uint256 erc20Supply)
describe("验证 Pausable 暂停功能", async () => {

    await hre.network.provider.send("hardhat_reset")
    describe('Exp Mixed Hotpot Token', async () => {
        it("校验 pause 功能", async () => {
            let signers = await ethers.getSigners()
            let buyer = signers[0]
            await network.provider.send("hardhat_setBalance", [buyer.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])
            await network.provider.send("hardhat_setBalance", [hre.treasury.address, Ether._hex.replace(/0x0+/, '0x')])
            await network.provider.send("hardhat_setBalance", [hre.platform.address, Ether._hex.replace(/0x0+/, '0x')])
            const hotpotTokenAbi = await hre.expToken(500,1000)

            let tx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)})
            await tx1.wait()

            expect(hre.factory.connect(buyer).pause(hotpotTokenAbi.address),'非 platform 用户不可调用 pause 功能').to.reverted
            expect(hre.factory.connect(buyer).unpause(hotpotTokenAbi.address),'非 platform 用户不可调用 unpause 功能').to.reverted
            
            expect(await hotpotTokenAbi.connect(buyer).paused(),'pause 前 paused 应当为 false').to.false
            // await expect(hotpotTokenAbi.connect(treasury).pause().then(async tx=>{ await tx.wait()}),'treasury 用户需要调用 pause 功能成功').to.any
            let tx2 = await hre.factory.connect(hre.platform).pause(hotpotTokenAbi.address)
            await tx2.wait();
            
            expect(await hotpotTokenAbi.paused(),'pause 后 paused 应当为 true').to.true

            let erc20Balance = await hotpotTokenAbi.balanceOf(buyer.address)
            expect(hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)}),'暂停后 不能mint').to.reverted
            expect(hotpotTokenAbi.connect(buyer).burn(buyer.address,erc20Balance),'暂停后 不能burn').to.reverted
            expect(hotpotTokenAbi.connect(buyer).transfer(buyer.address,erc20Balance),'暂停后 不能transfer').to.reverted

            let tx3 = await hre.factory.connect(hre.platform).unpause(hotpotTokenAbi.address)
            await tx3.wait()

            expect(await hotpotTokenAbi.paused(),'unpause 后 paused 应当为 false').to.false
            let tx4 = await hotpotTokenAbi.connect(buyer).transfer(hre.treasury.address,'100')
            await tx4.wait()

            let tx5 = await hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)})
            await tx5.wait()

            let tx6 = await hotpotTokenAbi.connect(buyer).burn(buyer.address,erc20Balance.div(2))
            await tx6.wait()
        })
    })
})
