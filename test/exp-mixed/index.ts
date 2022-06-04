import { expect } from "chai"
import { ethers, network } from "hardhat"
import { defines } from "../../hardhat.config";
import { ExpMixedBondingSwap__factory, ExpMixedHotpotToken__factory } from "../../typechain";

const hre = require("hardhat");
const Ether = defines.Unit.Ether
const Wei = defines.Unit.Wei
const Id = defines.Id


// 验证算子正确性，单次铸造并单次销毁
describe("指数 Mixed", async () => {
    describe("单例测试测试", async () => {
        
        // it("样例 mint 与 burn 方法 买卖正确性验证", async () => {
        //     let signers = await ethers.getSigners()
        //     let buyer = signers[Id.Buyer]
        //     let treasury = signers[Id.Treasury]
        //     let platform = signers[Id.Platform]
        //     const token = await hre.expToken(900,900)
        //     const hotpotTokenAbi = await ExpMixedHotpotToken__factory.connect(token.address,buyer)
            
        //     await network.provider.send("hardhat_setBalance", [treasury.address, '0x0'])
        //     await network.provider.send("hardhat_setBalance", [platform.address, '0x0'])
        //     await network.provider.send("hardhat_setBalance", [buyer.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])

        //     let testOne = async () => {
        //         let platformBalance = await platform.getBalance()
        //         let treasuryBalance = await treasury.getBalance()
        //         let contractAsset = await ethers.provider.getBalance(hotpotTokenAbi.address)
        //         let buyerBalance = await buyer.getBalance()
        //         let erc20Balance = await hotpotTokenAbi.balanceOf(buyer.address)
        //         let estimateBurn = await hotpotTokenAbi.estimateBurn(erc20Balance)
        //         let price = await hotpotTokenAbi.price()
        //         console.log(
        //             '平台eth余额', ethers.utils.formatEther(platformBalance),
        //             '国库eth余额', ethers.utils.formatEther(treasuryBalance),
        //             '合约eth资产', ethers.utils.formatEther(contractAsset),
        //             '价格eth/erc20', ethers.utils.formatEther(price), '\n',
        //             'BUYER eth 余额', ethers.utils.formatEther(buyerBalance),
        //             'BUYER erc20 余额', ethers.utils.formatEther(erc20Balance),
        //             'BUYER eth 可兑取', ethers.utils.formatEther(estimateBurn.nativeTokenAmount.add(estimateBurn.platformFee.add(estimateBurn.projectFee))),
        //             '误差损失 eth wei', contractAsset.sub(estimateBurn.nativeTokenAmount.add(estimateBurn.platformFee.add(estimateBurn.projectFee))).toString(), '\n',
        //         )
        //     }
        //     // await testOne()
        //     // let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: Ether.mul(2223) })
        //     // await mintTx1.wait()
            
        //     // await testOne()
        //     // let erc20Balance = await hotpotTokenAbi.balanceOf(buyer.address)
        //     // let mintTx2 = await hotpotTokenAbi.connect(buyer).burn(buyer.address, erc20Balance)
        //     // await mintTx2.wait()
        //     // await testOne()
        //     // let tet = ExpMixedBondingSwap__factory.connect(await hotpotTokenAbi.getBondingCurve(),buyer)
        //     // console.log(await tet.BondingCurveType())
        //     // expect(contractAsset.sub(estimateBurn.nativeTokenAmount.add(estimateBurn.platformFee.add(estimateBurn.projectFee))),'误差损失当线性增长').to.lt(Wei.mul(1000*(round+2)))
        // })
    })
})
