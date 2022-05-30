import { expect } from "chai"
import { ethers, network } from "hardhat"
const hre=require("hardhat")
const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')

describe("验证 Gas Fee 的收取", async () => {

    describe('Exp Mixed Hotpot Token', async () => {
        it("校验 mint 与 burn 方法 国库手续费", async () => {
            await hre.network.provider.send("hardhat_reset")
            let signers = await ethers.getSigners()
            let buyer = signers[0]
            const hotpotTokenAbi = await hre.expToken(500,1000)
            // mint 1 eth
            await network.provider.send("hardhat_setBalance", [hre.treasury.address, '0x0'])
            let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: Ether })
            await mintTx1.wait()
            let balance2 = await hre.treasury.getBalance()
            console.log('mintRate (', hre.mintRate, '/ 10000 ) mint 消耗 eth 1', 'treasury 获得 eth', ethers.utils.formatEther(balance2))
            expect(Ether.mul(hre.mintRate).div(10000).eq(balance2), '国库 mint 手续费计算错误').to.true
            // burn
            await network.provider.send("hardhat_setBalance", [hre.treasury.address, '0x0'])
            let erc20Balance3 = await hotpotTokenAbi.balanceOf(buyer.address)
            let asset4 = await ethers.provider.getBalance(hotpotTokenAbi.address)
            let burnTx2 = await hotpotTokenAbi.connect(buyer).burn(buyer.address, erc20Balance3)
            await burnTx2.wait()
            let asset5 = await ethers.provider.getBalance(hotpotTokenAbi.address)
            let balance6 = await hre.treasury.getBalance()
            console.log('burnRate (', hre.burnRate, '/ 10000 ) 合约 burn 消耗 eth', ethers.utils.formatEther(asset4.sub(asset5)), ' treasury 获得eth', ethers.utils.formatEther(balance6))
            expect(asset4.sub(asset5).mul(hre.burnRate).div(10000).eq(balance6), '国库 burn 手续费计算错误').to.true
        })

        it("校验 mint 与 burn 方法 平台手续费", async () => {
            let signers = await ethers.getSigners()
            let buyer = signers[0]
            const hotpotTokenAbi = await hre.expToken(100,100)
            // mint 1 eth
            await network.provider.send("hardhat_setBalance", [hre.platform.address, '0x0'])
            let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: Ether })
            await mintTx1.wait()
            let balance2 = await hre.platform.getBalance()
            console.log('mintRate (', hre.mintRate, '/ 10000 ) mint 消耗 eth 1', 'platform 获得 eth', ethers.utils.formatEther(balance2))
            expect(Ether.mul(100).div(10000).eq(balance2), '平台 mint 手续费计算错误').to.true
            // burn 
            await network.provider.send("hardhat_setBalance", [hre.platform.address, '0x0'])
            let erc20Balance3 = await hotpotTokenAbi.balanceOf(buyer.address)
            let asset4 = await ethers.provider.getBalance(hotpotTokenAbi.address)
            let burnTx2 = await hotpotTokenAbi.connect(buyer).burn(buyer.address, erc20Balance3)
            await burnTx2.wait()
            let asset5 = await ethers.provider.getBalance(hotpotTokenAbi.address)
            let balance6 = await hre.platform.getBalance()
            console.log('burnRate (', hre.burnRate, '/ 10000 ) 合约 burn 消耗eth', ethers.utils.formatEther(asset4.sub(asset5)), 'platform 获得 eth', ethers.utils.formatEther(balance6))
            expect(asset4.sub(asset5).mul(100).div(10000).eq(balance6), '平台 burn 手续费计算错误').to.true
        })
    })
})
