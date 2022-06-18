import { expect } from "chai"
import { ethers, network } from "hardhat"
import { defines } from "../../hardhat.config";
import { LinearMixedHotpotToken__factory } from "../../typechain";

const hre = require("hardhat");
const Ether = defines.Unit.Ether
const Wei = defines.Unit.Wei
const Id = defines.Id

const round = 10

describe("HotpotToken 滑点测试", async () => {

    describe('Linear Mixed Hotpot Token', async () => {
        it("验证 mint 时滑点", async () => {
            let signers = await ethers.getSigners()
            let buyer = signers[Id.Buyer]
            let treasury = signers[Id.Treasury]
            let platform = signers[Id.Platform]
            
            const token = await hre.linearToken(100,100)
            const hotpotTokenAbi = await LinearMixedHotpotToken__factory.connect(token.address,buyer)
            
            await network.provider.send("hardhat_setBalance", [treasury.address, '0x0'])
            await network.provider.send("hardhat_setBalance", [platform.address, '0x0'])
            await network.provider.send("hardhat_setBalance", [buyer.address, Ether.mul(100000000)._hex.replace(/0x0+/, '0x')])
            const buyStep = 1
            const testOne = async () => {
                let beforeEstimate = await hotpotTokenAbi.estimateMint(Ether.mul(buyStep))
                let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: Ether.mul(buyStep) })
                await mintTx1.wait()
                let currentSupply = await hotpotTokenAbi.totalSupply()
                let afterEstimate = await hotpotTokenAbi.estimateMint(Ether.mul(buyStep))
                console.log('[',ethers.utils.formatEther(currentSupply),',',afterEstimate.daoTokenAmount.mul(10000).div(beforeEstimate.daoTokenAmount).toNumber()/10000,'],')
            }
            for(let i=0; i<1000; i++) {
                await testOne()
            }
        })

    })

})
