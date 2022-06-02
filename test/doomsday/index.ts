import { expect } from "chai"
import { ethers, network } from "hardhat"
import { defines } from "../../hardhat.config";
import { ExpMixedHotpotToken__factory, HotpotTokenFactory__factory } from "../../typechain";

const hre = require("hardhat");
const Ether = defines.Unit.Ether
const Id = defines.Id

describe("验证 Doomsday 销毁功能", async () => {
    describe('Exp Mixed Hotpot Token', async () => {
        it("校验 unpause 情况下 doomsday 功能", async () => {
            let signers = await ethers.getSigners()
            let buyer = signers[Id.Buyer]
            let treasury = signers[Id.Treasury]
            let platform = signers[Id.Platform]

            const token = await hre.expToken(500,1000)
            const hotpotTokenAbi = await ExpMixedHotpotToken__factory.connect(token.address,buyer)
            const factoryAbi = await HotpotTokenFactory__factory.connect(hre.factory.address,platform)
            await network.provider.send("hardhat_setBalance", [buyer.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])
            await network.provider.send("hardhat_setBalance", [treasury.address, Ether._hex.replace(/0x0+/, '0x')])
            await network.provider.send("hardhat_setBalance", [platform.address, Ether._hex.replace(/0x0+/, '0x')])

            let tx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address,0,{value: Ether.mul(10)})
            await tx1.wait()
            

            expect(await hotpotTokenAbi.doomsday(),'declareDoomsday 前 doomsday 应当为 false').to.false

            await expect(hotpotTokenAbi.connect(buyer).declareDoomsday(),'非 platform 用户不可 declareDoomsday').to.reverted

            await expect(hotpotTokenAbi.connect(treasury).declareDoomsday(),'非 platform 用户不可 declareDoomsday').to.reverted

            await expect(hotpotTokenAbi.connect(treasury).destroyForDoomsday(),'treasury 用户在 declare 之前不可 destory').to.reverted

            let tx2 = await factoryAbi.connect(platform).declareDoomsday(hotpotTokenAbi.address);
            await tx2.wait();

            expect(await hotpotTokenAbi.paused(),'declareDoomsday 后 pause 应当为 true').to.true
            
            await expect(hotpotTokenAbi.connect(buyer).destroyForDoomsday(),'非 treasury 用户不可 destoryForDoomsday').to.reverted
            await expect(hotpotTokenAbi.connect(platform).destroyForDoomsday(),'非 treasury 用户不可 destoryForDoomsday').to.reverted
            
            let asset = await treasury.provider.getBalance(hotpotTokenAbi.address)
            let balanceOfTreasuryBefore = await treasury.getBalance()

            let tx3 = await hotpotTokenAbi.connect(treasury).destroyForDoomsday()
            let txrpt3 = await tx3.wait()
            let gas = txrpt3.gasUsed.mul(txrpt3.effectiveGasPrice)
            let balanceOfTreasuryAfter = await treasury.getBalance()
            expect(asset.eq(balanceOfTreasuryAfter.add(gas).sub(balanceOfTreasuryBefore)),'合约余额 未打入 treasury 地址').to.true

        })
    })
})
