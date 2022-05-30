import { expect } from "chai"
import { ethers, network } from "hardhat"

const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')
const hre = require("hardhat");
const round = 10

describe("HotpotToken 大规模铸造销毁测试", async () => {

    describe('Linear Mixed Hotpot Token', async () => {

        it("样例 mint 与 burn 方法 个人单买多轮", async () => {
            await hre.network.provider.send("hardhat_reset")
            let signers = await ethers.getSigners()
            let buyer = signers[3]
            const hotpotTokenAbi = await hre.linearToken(100,100)
            await network.provider.send("hardhat_setBalance", [hre.treasury.address, '0x0'])
            await network.provider.send("hardhat_setBalance", [hre.platform.address, '0x0'])
            await network.provider.send("hardhat_setBalance", [buyer.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])

            for (let i = 0; i < round; i++) {
                let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: Ether.mul(1000) })
                await mintTx1.wait()
                let platformBalance = await hre.platform.getBalance()
                let treasuryBalance = await hre.treasury.getBalance()
                let contractAsset = await ethers.provider.getBalance(hotpotTokenAbi.address)
                let buyerBalance = await buyer.getBalance()
                let erc20Balance = await hotpotTokenAbi.balanceOf(buyer.address)
                let estimateBurn = await hotpotTokenAbi.estimateBurn(erc20Balance)
                let price = await hotpotTokenAbi.price()
                console.log(
                    '平台eth余额', ethers.utils.formatEther(platformBalance),
                    '国库eth余额', ethers.utils.formatEther(treasuryBalance),
                    '合约eth资产', ethers.utils.formatEther(contractAsset),
                    '价格eth/erc20', ethers.utils.formatEther(price), '\n',
                    'BUYER eth 余额', ethers.utils.formatEther(buyerBalance),
                    'BUYER erc20 余额', ethers.utils.formatEther(erc20Balance),
                    'BUYER eth 可兑取', ethers.utils.formatEther(estimateBurn.dy),
                    '误差损失 eth wei', contractAsset.sub(estimateBurn.dy).toString(), '\n',
                )
            }
        })

        it("样例 mint 与 burn 方法 个人单卖多轮", async () => {
            await hre.network.provider.send("hardhat_reset")
            let signers = await ethers.getSigners()
            let buyer = signers[3]
            const hotpotTokenAbi = await hre.linearToken(100,100)

            await network.provider.send("hardhat_setBalance", [hre.treasury.address, '0x0'])
            await network.provider.send("hardhat_setBalance", [hre.platform.address, '0x0'])
            await network.provider.send("hardhat_setBalance", [buyer.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])
            let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: Ether.mul(500000) })
            await mintTx1.wait()
            let totalErc20Balance = await hotpotTokenAbi.balanceOf(buyer.address)

            for (let i = 0; i < round; i++) {
                let platformBalance = await hre.platform.getBalance()
                let treasuryBalance = await hre.treasury.getBalance()
                let contractAsset = await ethers.provider.getBalance(hotpotTokenAbi.address)
                let buyerBalance = await buyer.getBalance()
                let erc20Balance = await hotpotTokenAbi.balanceOf(buyer.address)
                let estimateBurn = await hotpotTokenAbi.estimateBurn(erc20Balance)
                let price = await hotpotTokenAbi.price()
                console.log(
                    '平台eth余额', ethers.utils.formatEther(platformBalance),
                    '国库eth余额', ethers.utils.formatEther(treasuryBalance),
                    '合约eth资产', ethers.utils.formatEther(contractAsset),
                    '价格eth/erc20', ethers.utils.formatEther(price), '\n',
                    'BUYER eth 余额', ethers.utils.formatEther(buyerBalance),
                    'BUYER erc20 余额', ethers.utils.formatEther(erc20Balance),
                    'BUYER eth 可兑取', ethers.utils.formatEther(estimateBurn.dy),
                    '误差损失 eth wei', contractAsset.sub(estimateBurn.dy).toString(), '\n',
                )
                let burnTx2 = await hotpotTokenAbi.connect(buyer).burn(buyer.address, totalErc20Balance.div(100))
                await burnTx2.wait()
            }
        })

        it("样例 大规模 mint 与 burn 方法 买卖混合多轮测试", async () => {
            await hre.network.provider.send("hardhat_reset")
            let signers = await ethers.getSigners()
            let platform = signers[1]
            let treasury = signers[2]
            let buyer1 = signers[3]
            let buyer2 = signers[4]
            let buyer3 = signers[5]
            const hotpotTokenAbi = await hre.linearToken(100,100)

            await network.provider.send("hardhat_setBalance", [treasury.address, '0x0'])
            await network.provider.send("hardhat_setBalance", [platform.address, '0x0'])
            await network.provider.send("hardhat_setBalance", [buyer1.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])
            await network.provider.send("hardhat_setBalance", [buyer2.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])
            await network.provider.send("hardhat_setBalance", [buyer3.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])


            for (let i = 0; i < round; i++) {
                // buyer 1 只买不卖 1~99 ether
                // buyer 3 买了随机转给 buyer 2
                let mintTx1 = await hotpotTokenAbi.connect(buyer1).mint(buyer1.address, 0, { value: Ether.mul(Math.floor(Math.random() * 49) + 1) })
                await mintTx1.wait()
                // buyer 2 即买又卖一部分 
                let mintTx2 = await hotpotTokenAbi.connect(buyer2).mint(buyer2.address, 0, { value: Ether.mul(Math.floor(Math.random() * 999) + 1) })
                await mintTx2.wait()
                let buyer2Erc20 = await hotpotTokenAbi.balanceOf(buyer2.address)
                let burnTx2 = await hotpotTokenAbi.connect(buyer2).burn(buyer2.address, buyer2Erc20.mul(Math.floor(Math.random() * 99) + 1).div(100))
                await burnTx2.wait()
                // buyer 3 随机买大单，并随机往 buyer 2，buyer 3 中转入
                // buyer 3 会触发随机的抛出动作
                if (Math.random() < 0.5) {
                    let mintTx3 = await hotpotTokenAbi.connect(buyer3).mint(buyer2.address, 0, { value: Ether.mul(Math.floor(Math.random() * 900) + 100) })
                    await mintTx3.wait()
                } else {
                    let mintTx3 = await hotpotTokenAbi.connect(buyer3).mint(buyer3.address, 0, { value: Ether.mul(Math.floor(Math.random() * 900) + 100) })
                    await mintTx3.wait()
                }
                if (Math.random() < 0.1) {
                    let buyer3Erc20 = await hotpotTokenAbi.balanceOf(buyer3.address)
                    if (buyer3Erc20.gt(Ether)) {
                        let burnTx3 = await hotpotTokenAbi.connect(buyer3).burn(buyer3.address, buyer3Erc20.mul(Math.floor(Math.random() * 99) + 1).div(100))
                        await burnTx3.wait()
                    }
                }
                let platformBalance = await platform.getBalance()
                let treasuryBalance = await treasury.getBalance()
                let contractAsset = await ethers.provider.getBalance(hotpotTokenAbi.address)
                let contractTotalSupply = await hotpotTokenAbi.totalSupply()
                let estimateBurn = await hotpotTokenAbi.estimateBurn(contractTotalSupply)
                let price = await hotpotTokenAbi.price()
                let buyer1Native = await buyer1.getBalance()
                let buyer1Erc20 = await hotpotTokenAbi.balanceOf(buyer1.address)
                let buyer2Native = await buyer2.getBalance()
                buyer2Erc20 = await hotpotTokenAbi.balanceOf(buyer2.address)
                let buyer3Native = await buyer3.getBalance()
                let buyer3Erc20 = await hotpotTokenAbi.balanceOf(buyer3.address)
                console.log(
                    '平台eth余额', ethers.utils.formatEther(platformBalance),
                    '国库eth余额', ethers.utils.formatEther(treasuryBalance),
                    '合约erc20supply', ethers.utils.formatEther(contractTotalSupply),
                    '合约eth资产', ethers.utils.formatEther(contractAsset),
                    'eth 可兑取', ethers.utils.formatEther(estimateBurn.dy),
                    '误差损失 eth wei', contractAsset.sub(estimateBurn.dy).toString(),
                    '价格eth/erc20', ethers.utils.formatEther(price), '\n',
                    'BUYER 1 eth 余额', ethers.utils.formatEther(buyer1Native),
                    'erc20 余额', ethers.utils.formatEther(buyer1Erc20), '\n',
                    'BUYER 2 eth 余额', ethers.utils.formatEther(buyer2Native),
                    'erc20 余额', ethers.utils.formatEther(buyer2Erc20), '\n',
                    'BUYER 3 eth 余额', ethers.utils.formatEther(buyer3Native),
                    'erc20 余额', ethers.utils.formatEther(buyer3Erc20), '\n',
                )
            }
        })
    })
})
