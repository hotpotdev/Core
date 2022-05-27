import { expect } from "chai"
import { ethers, network } from "hardhat"

const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')

// 验证算子正确性，单次铸造并单次销毁
// mining(uint256 nativeTokens, uint256 erc20Supply)
// burning(uint256 erc20Tokens, uint256 erc20Supply)
describe("验证 Bonding Curve Swap 计算函数 算子测试", async () => {
    let calculatorContract = "ExpMixedBondingSwap"
    
    describe("Exp Mixed Bonding Swap", async () => {

        it("验证 计算方程 的 结果", async () => {
            const BondingCurve = await ethers.getContractFactory(calculatorContract)
            const curve = await BondingCurve.deploy()
            await curve.deployed()
            const curveAbi = curve

            let testOne = async (nativeAsset) => {
                let ans = await curveAbi.mining(nativeAsset, 0)
                let ans2 = await curveAbi.burning(ans.dx, ans.dx)
                let price = await curveAbi.price(ans.dx)
                console.debug(
                    '铸造消耗eth', ethers.utils.formatEther(nativeAsset),
                    '生成erc20', ethers.utils.formatEther(ans2.dx),
                    '销毁退还eth', ethers.utils.formatEther(ans2.dy),
                    '价格eth/erc20', ethers.utils.formatEther(price),
                    '误差(wei)', nativeAsset.sub(ans2.dy).toString())
            }
            // 测试10000000 erc20=> 2000 eth
            await testOne(Ether.mul(2000))
        })

        // 在 erc20supply 为 0 时，从 0 到 y0 个 eth, 兑换出的 dx 个 erc20, 全部销毁兑换出 y1 个 eth，验证 计算误差 的规模
        // y0 = 2^n * 1e9 [1 gwei,1 gether]
        it("验证 计算方程 的 整体误差", async () => {
            const BondingCurve = await ethers.getContractFactory(calculatorContract)
            const curve = await BondingCurve.deploy()
            await curve.deployed()
            const curveAbi = curve

            let testOne = async (nativeAsset) => {
                let ans = await curveAbi.mining(nativeAsset, 0)
                let ans2 = await curveAbi.burning(ans.dx, ans.dx)
                let price = await curveAbi.price(ans.dx)
                console.debug(
                    '铸造消耗eth', ethers.utils.formatEther(nativeAsset),
                    '生成erc20', ethers.utils.formatEther(ans2.dx),
                    '销毁退还eth', ethers.utils.formatEther(ans2.dy),
                    '价格eth/erc20', ethers.utils.formatEther(price),
                    '误差(wei)', nativeAsset.sub(ans2.dy).toString())
                expect(nativeAsset.gt(ans2.dy), "mining消耗的nativeToken需要大于burning生成的nativeToken").to.true
                expect(nativeAsset.sub(ans2.dy).lt(1000) || nativeAsset.div(nativeAsset.sub(ans2.dy)).gt(Ether), "mining与burning的误差需要小于1000wei || 误差比例小于1e-18").to.true
            }

            // 测试最小的边界值 1e9 wei ETH
            // 测试最大的边界值 1e9 ether ETH
            let lowerLimit = GWei
            let upperLimit = Ether.mul(GWei)
            for (let i = lowerLimit; i.lt(upperLimit); i = i.mul(2)) {
                await testOne(i)
            }
        })

        // 在 erc20supply 为 x0 时，兑换 1 eth, 兑换出的 dx 个 erc20, 全部销毁兑换出 y1 个 eth，验证 计算误差 的规模
        // x0 = 2^n * 1e9 [1 gwei,1 gether]
        it("验证 计算方程 的 局部误差", async () => {
            const BondingCurve = await ethers.getContractFactory(calculatorContract)
            const curve = await BondingCurve.deploy()
            await curve.deployed()
            const curveAbi = curve

            let testOne = async (fromErc20Supply, nativeAsset) => {
                let ans = await curveAbi.mining(nativeAsset, fromErc20Supply)
                let ans2 = await curveAbi.burning(ans.dx, fromErc20Supply.add(ans.dx))
                let price = await curveAbi.price(fromErc20Supply)
                console.debug(
                    'erc20Supply', ethers.utils.formatEther(fromErc20Supply),
                    '铸造消耗', ethers.utils.formatEther(nativeAsset),
                    '生成erc20', ethers.utils.formatEther(ans.dx),
                    '销毁退还', ethers.utils.formatEther(ans2.dy),
                    '价格eth/erc20', ethers.utils.formatEther(price),
                    '误差', nativeAsset.sub(ans2.dy).toString())
                expect(nativeAsset.gt(ans2.dy), "mining消耗的nativeToken需要大于burning生成的").to.true
                expect(price.gt(Ether.div(10))||ans.dx.lt(Ether.div(10000)) || nativeAsset.sub(ans2.dy).lt(ethers.BigNumber.from(10000)), "当price小于0.1时，mining与burning的误差需要小于10000wei").to.true
            }

            // 测试最小的边界值 1 wei
            // 测试最大的边界值 1e9 ether
            let lowerLimit = ethers.BigNumber.from(1)
            let upperLimit = Ether.mul(6e7)
            for (let i = lowerLimit; i.lt(upperLimit); i = i.mul(2)) {
                await testOne(i, Ether)
            }
        })

        it("验证 计算方程 的 溢出问题", async () => {
            const BondingCurve = await ethers.getContractFactory(calculatorContract)
            const curve = await BondingCurve.deploy()
            await curve.deployed()
            const curveAbi = curve

            expect(curveAbi.mining(Wei.shl(200), Wei)).to.be.reverted
            expect(curveAbi.mining(Wei, Wei.shl(200))).to.be.reverted
            expect(curveAbi.burning(1, 10)).to.be.reverted
        })
    })

})
