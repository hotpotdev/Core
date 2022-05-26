import { expect } from "chai"
import { ethers, network } from "hardhat"
import { ExpMixedHotpotToken__factory } from "../../typechain"

const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')

// 验证算子正确性，单次铸造并单次销毁
// mining(uint256 nativeTokens, uint256 erc20Supply)
// burning(uint256 erc20Tokens, uint256 erc20Supply)
describe("验证 Pausable 暂停功能", async () => {
    let calculatorContract = "ExpMixedBondingSwap"
    let hotpotContract = "ExpHotpotTokenFactory"

    describe('Exp Mixed Hotpot Token', async () => {
        it("校验 pause 功能", async () => {
            let signers = await ethers.getSigners()
            let buyer = signers[0]
            let treasury = signers[1]
            let platform = signers[2]
            const HotpotToken = await ethers.getContractFactory(hotpotContract)
            await network.provider.send("hardhat_setBalance", [buyer.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])
            await network.provider.send("hardhat_setBalance", [treasury.address, Ether._hex.replace(/0x0+/, '0x')])
            await network.provider.send("hardhat_setBalance", [platform.address, Ether._hex.replace(/0x0+/, '0x')])
            let mintRate = 500
            let burnRate = 1000
            const erc20 = await HotpotToken.deploy('test', 'test', treasury.address, mintRate, burnRate, platform.address,false,Ether.mul('50000000000'))
            await erc20.deployed()
            const hotpotTokenAbi = ExpMixedHotpotToken__factory.connect(erc20.address,erc20.signer)

            let tx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)})
            await tx1.wait()

            expect(hotpotTokenAbi.connect(buyer).pause(),'非 platform 用户不可调用 pause 功能').to.reverted
            expect(hotpotTokenAbi.connect(buyer).unpause(),'非 platform 用户不可调用 unpause 功能').to.reverted
            
            expect(await hotpotTokenAbi.paused(),'pause 前 paused 应当为 false').to.false
            // await expect(hotpotTokenAbi.connect(treasury).pause().then(async tx=>{ await tx.wait()}),'treasury 用户需要调用 pause 功能成功').to.any
            let tx2 = await hotpotTokenAbi.connect(platform).pause()
            await tx2.wait();
            
            expect(await hotpotTokenAbi.paused(),'pause 后 paused 应当为 true').to.true

            let erc20Balance = await hotpotTokenAbi.balanceOf(buyer.address)
            expect(hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)}),'暂停后 不能mint').to.reverted
            expect(hotpotTokenAbi.connect(buyer).burn(buyer.address,erc20Balance),'暂停后 不能burn').to.reverted
            expect(hotpotTokenAbi.connect(buyer).transfer(buyer.address,erc20Balance),'暂停后 不能transfer').to.reverted

            let tx3 = await hotpotTokenAbi.connect(platform).unpause()
            await tx3.wait()

            expect(await hotpotTokenAbi.paused(),'unpause 后 paused 应当为 false').to.false
            let tx4 = await hotpotTokenAbi.connect(buyer).transfer(treasury.address,'100')
            await tx4.wait()

            let tx5 = await hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)})
            await tx5.wait()

            let tx6 = await hotpotTokenAbi.connect(buyer).burn(buyer.address,erc20Balance.div(2))
            await tx6.wait()
        })
    })
})
