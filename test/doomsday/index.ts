import { expect } from "chai"
import { ethers, network } from "hardhat"
import { ExpMixedHotpotToken__factory } from "../../typechain"

const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')

// 验证算子正确性，单次铸造并单次销毁
// mining(uint256 nativeTokens, uint256 erc20Supply)
// burning(uint256 erc20Tokens, uint256 erc20Supply)
describe("验证 Doomsday 销毁功能", async () => {
    let calculatorContract = "ExpMixedBondingSwap"
    let hotpotContract = "ExpHotpotTokenFactory"

    describe('Exp Mixed Hotpot Token', async () => {
        it("校验 unpause 情况下 doomsday 功能", async () => {
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

            expect(await hotpotTokenAbi.doomsday(),'declareDoomsday 前 doomsday 应当为 false').to.false

            expect(hotpotTokenAbi.connect(buyer).declareDoomsday(),'非 platform 用户不可 declareDoomsday').to.reverted
            expect(hotpotTokenAbi.connect(treasury).declareDoomsday(),'非 platform 用户不可 declareDoomsday').to.reverted
            
            expect(hotpotTokenAbi.connect(treasury).destroyForDoomsday(),'treasury 用户在 declare 之前不可 destory').to.reverted

            let tx2 = await hotpotTokenAbi.connect(platform).declareDoomsday();
            await tx2.wait();

            expect(await hotpotTokenAbi.paused(),'declareDoomsday 后 pause 应当为 true').to.true
            
            expect(hotpotTokenAbi.connect(buyer).destroyForDoomsday(),'非 treasury 用户不可 destoryForDoomsday').to.reverted
            expect(hotpotTokenAbi.connect(platform).destroyForDoomsday(),'非 treasury 用户不可 destoryForDoomsday').to.reverted
            
            let asset = await treasury.provider.getBalance(erc20.address)
            let balanceOfTreasuryBefore = await treasury.getBalance()

            let tx3 = await hotpotTokenAbi.connect(treasury).destroyForDoomsday()
            let txrpt3 = await tx3.wait()
            let gas = txrpt3.gasUsed.mul(txrpt3.effectiveGasPrice)
            let balanceOfTreasuryAfter = await treasury.getBalance()
            expect(asset.eq(balanceOfTreasuryAfter.add(gas).sub(balanceOfTreasuryBefore)),'合约余额 未打入 treasury 地址').to.true

        })
    })
})
