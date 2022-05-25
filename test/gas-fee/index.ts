import { expect } from "chai"
import { ethers, network } from "hardhat"

const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')

// 验证算子正确性，单次铸造并单次销毁
// mining(uint256 nativeTokens, uint256 erc20Supply)
// burning(uint256 erc20Tokens, uint256 erc20Supply)
describe("验证 Gas Fee 的收取", async () => {
    let calculatorContract = "LinearMixedBondingSwap"
    let hotpotContract = "LinearHotpotTokenFactory"

    describe('Hotpot Mixed Token', async () => {
        it("校验 mint 与 burn 方法 国库手续费", async () => {
            let signers = await ethers.getSigners()
            let treasury = signers[1]
            const HotpotToken = await ethers.getContractFactory(hotpotContract)
            let mintRate = 500
            let burnRate = 1000
            const erc20 = await HotpotToken.deploy('test', 'test', treasury.address, mintRate, burnRate, signers[2].address)
            await erc20.deployed()
            // mint 1 eth
            await network.provider.send("hardhat_setBalance", [treasury.address, '0x0'])
            let mintTx1 = await erc20.connect(signers[0]).mint(signers[0].address, 0, { value: Ether })
            await mintTx1.wait()
            let balance2 = await treasury.getBalance()
            console.log('mintRate (', mintRate, '/ 10000 ) mint 消耗 eth 1', 'treasury 获得 eth', ethers.utils.formatEther(balance2))
            expect(Ether.mul(mintRate).div(10000).eq(balance2), '国库 mint 手续费计算错误').to.true
            // burn
            await network.provider.send("hardhat_setBalance", [treasury.address, '0x0'])
            let erc20Balance3 = await erc20.balanceOf(signers[0].address)
            let asset4 = await ethers.provider.getBalance(erc20.address)
            let burnTx2 = await erc20.connect(signers[0]).burn(signers[0].address, erc20Balance3)
            await burnTx2.wait()
            let asset5 = await ethers.provider.getBalance(erc20.address)
            let balance6 = await treasury.getBalance()
            console.log('burnRate (', burnRate, '/ 10000 ) 合约 burn 消耗 eth', ethers.utils.formatEther(asset4.sub(asset5)), ' treasury 获得eth', ethers.utils.formatEther(balance6))
            expect(asset4.sub(asset5).mul(burnRate).div(10000).eq(balance6), '国库 burn 手续费计算错误').to.true
        })

        it("校验 mint 与 burn 方法 平台手续费", async () => {
            let signers = await ethers.getSigners()
            let platform = signers[1]
            const HotpotToken = await ethers.getContractFactory(hotpotContract)
            const mintRate = 100
            const burnRate = 100
            const erc20 = await HotpotToken.deploy('test', 'test', signers[2].address, mintRate, burnRate, platform.address)
            await erc20.deployed()
            // mint 1 eth
            await network.provider.send("hardhat_setBalance", [platform.address, '0x0'])
            let mintTx1 = await erc20.connect(signers[0]).mint(signers[0].address, 0, { value: Ether })
            await mintTx1.wait()
            let balance2 = await platform.getBalance()
            console.log('mintRate (', mintRate, '/ 10000 ) mint 消耗 eth 1', 'platform 获得 eth', ethers.utils.formatEther(balance2))
            expect(Ether.mul(mintRate).div(10000).eq(balance2), '平台 mint 手续费计算错误').to.true
            // burn 
            await network.provider.send("hardhat_setBalance", [platform.address, '0x0'])
            let erc20Balance3 = await erc20.balanceOf(signers[0].address)
            let asset4 = await ethers.provider.getBalance(erc20.address)
            let burnTx2 = await erc20.connect(signers[0]).burn(signers[0].address, erc20Balance3)
            await burnTx2.wait()
            let asset5 = await ethers.provider.getBalance(erc20.address)
            let balance6 = await platform.getBalance()
            console.log('burnRate (', burnRate, '/ 10000 ) 合约 burn 消耗eth', ethers.utils.formatEther(asset4.sub(asset5)), 'platform 获得 eth', ethers.utils.formatEther(balance6))
            expect(asset4.sub(asset5).mul(burnRate).div(10000).eq(balance6), '平台 burn 手续费计算错误').to.true
        })
    })
})
