import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { defines } from "../../hardhat.config";
import { SqrtMixedBondingSwap__factory } from "../../typechain";

const Ether = defines.Unit.Ether;
const GWei = defines.Unit.GWei;
const Wei = defines.Unit.Wei;
const Id = defines.Id;

const a = GWei;
let hre = require("hardhat");
const data = hre.ethers.utils.defaultAbiCoder.encode(["uint256"], [a]);
// 验证算子正确性，单次铸造并单次销毁
describe("验证 Bonding Curve Swap 计算函数 算子测试", async () => {
    let calculatorContract = "SqrtMixedBondingSwap";
    let supply = Ether.mul(1e8);
    // let supply = Ether.mul(a).mul(b)
    let px = Ether.mul(10000);
    let tvl = Ether.mul(GWei.mul(1000)).mul(2).div(3);
    describe("Sqrt Mixed Bonding Swap", async () => {
        it("验证 计算方程 的 结果", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            const BondingCurve = await ethers.getContractFactory(calculatorContract);
            const curve = await BondingCurve.deploy();
            await curve.deployed();
            const curveAbi = SqrtMixedBondingSwap__factory.connect(curve.address, buyer);

            let testOne = async (nativeAsset) => {
                let ans = await curveAbi.calculateMintAmountFromBondingCurve(nativeAsset, 0, data);
                let ans2 = await curveAbi.calculateBurnAmountFromBondingCurve(ans.daoTokenAmount, ans.daoTokenAmount, data);
                let price = await curveAbi.price(ans.daoTokenAmount, data);
                let ans3 = await curveAbi.calculateBurnAmountFromBondingCurve(Ether, ans.daoTokenAmount.add(Ether), data);
                console.debug(
                    "铸造消耗eth",
                    ethers.utils.formatEther(nativeAsset),
                    "生成erc20",
                    ethers.utils.formatEther(ans.daoTokenAmount),
                    "销毁退还eth",
                    ethers.utils.formatEther(ans2.nativeTokenAmount),
                    "价格eth/erc20",
                    ethers.utils.formatEther(price),
                    "微分价格",
                    ethers.utils.formatEther(ans3.nativeTokenAmount.mul(Ether).div(ans3[0])),
                    "误差(wei)",
                    nativeAsset.sub(ans2.nativeTokenAmount).toString()
                );
                expect(
                    ans3.nativeTokenAmount.mul(Ether).div(ans3[0]).sub(price).abs().lt(price.div(1000)),
                    "价格公式误差与微元法计算误差应当小于 1 %。"
                ).to.true;
                expect(
                    ans.daoTokenAmount.sub(supply).abs().lt(ans.daoTokenAmount.div(20)),
                    "特例要求, " + formatEther(tvl) + " eth <=> " + formatEther(supply) + " erc20"
                ).to.true;
                expect(
                    price.sub(px).abs().lt(price.div(20)),
                    "特例要求, " + formatEther(tvl) + " eth <=> " + formatEther(supply) + " erc20 时 price " + formatEther(px)
                ).to.true;
            };
            // 测试pmax erc20=> tvl eth
            await testOne(tvl);
        });

        // 在 erc20supply 为 0 时，从 0 到 y0 个 eth, 兑换出的 dx 个 erc20, 全部销毁兑换出 y1 个 eth，验证 计算误差 的规模
        // y0 = 2^n * 1e9 [1 gwei,1 gether]
        it("验证 计算方程 的 整体误差", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            const BondingCurve = await ethers.getContractFactory(calculatorContract);
            const curve = await BondingCurve.deploy();
            await curve.deployed();
            const curveAbi = SqrtMixedBondingSwap__factory.connect(curve.address, buyer);

            let testOne = async (nativeAsset) => {
                let ans = await curveAbi.calculateMintAmountFromBondingCurve(nativeAsset, 0, data);
                let ans2 = await curveAbi.calculateBurnAmountFromBondingCurve(ans.daoTokenAmount, ans.daoTokenAmount, data);
                let price = await curveAbi.price(ans.daoTokenAmount, data);
                console.debug(
                    "铸造消耗eth",
                    ethers.utils.formatEther(nativeAsset),
                    "生成erc20",
                    ethers.utils.formatEther(ans2[0]),
                    "销毁退还eth",
                    ethers.utils.formatEther(ans2.nativeTokenAmount),
                    "价格eth/erc20",
                    ethers.utils.formatEther(price),
                    "误差(wei)",
                    nativeAsset.sub(ans2.nativeTokenAmount).toString()
                );
                expect(
                    nativeAsset.gt(ans2.nativeTokenAmount),
                    "calculateMintAmountFromBondingCurve消耗的nativeToken需要大于calculateBurnAmountFromBondingCurve生成的nativeToken"
                ).to.true;
                expect(
                    nativeAsset.sub(ans2.nativeTokenAmount).div(nativeAsset).toNumber() < 0.000000001,
                    "calculateMintAmountFromBondingCurve与calculateBurnAmountFromBondingCurve的误差比例小于1e-9"
                ).to.true;
            };

            // 测试最小的边界值 1e9 wei ETH
            // 测试最大的边界值 1e9 ether ETH
            let lowerLimit = GWei;
            let upperLimit = tvl.mul(2);
            for (let i = lowerLimit; i.lt(upperLimit); i = i.mul(2)) {
                await testOne(i);
            }
            await testOne(tvl);
        });

        // 在 erc20supply 为 x0 时，兑换 1 eth, 兑换出的 dx 个 erc20, 全部销毁兑换出 y1 个 eth，验证 计算误差 的规模
        // x0 = 2^n * 1e9 [1 gwei,1 gether]
        it("验证 计算方程 的 局部误差", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            const BondingCurve = await ethers.getContractFactory(calculatorContract);
            const curve = await BondingCurve.deploy();
            await curve.deployed();
            const curveAbi = SqrtMixedBondingSwap__factory.connect(curve.address, buyer);

            let testOne = async (fromErc20Supply, nativeAsset) => {
                let ans = await curveAbi.calculateMintAmountFromBondingCurve(nativeAsset, fromErc20Supply, data);
                let ans2 = await curveAbi.calculateBurnAmountFromBondingCurve(
                    ans.daoTokenAmount,
                    fromErc20Supply.add(ans.daoTokenAmount),
                    data
                );
                let price = await curveAbi.price(fromErc20Supply, data);
                console.debug(
                    "erc20Supply",
                    ethers.utils.formatEther(fromErc20Supply),
                    "铸造消耗",
                    ethers.utils.formatEther(nativeAsset),
                    "生成erc20",
                    ethers.utils.formatEther(ans.daoTokenAmount),
                    "销毁退还",
                    ethers.utils.formatEther(ans2.nativeTokenAmount),
                    "价格eth/erc20",
                    ethers.utils.formatEther(price),
                    "误差",
                    nativeAsset.sub(ans2.nativeTokenAmount).toString()
                );
                expect(
                    nativeAsset.gt(ans2.nativeTokenAmount),
                    "calculateMintAmountFromBondingCurve消耗的nativeToken需要大于calculateBurnAmountFromBondingCurve生成的"
                ).to.true;
                expect(
                    ans2.nativeTokenAmount.sub(nativeAsset).abs().div(nativeAsset).toNumber() < 0.000000001,
                    "calculateMintAmountFromBondingCurve与calculateBurnAmountFromBondingCurve的误差需要小于1e-9"
                ).to.true;
            };

            // 测试最小的边界值 1 wei
            // 测试最大的边界值 1e9 ether
            let lowerLimit = ethers.BigNumber.from(1);
            let upperLimit = supply;
            for (let i = lowerLimit; i.lt(upperLimit); i = i.mul(2)) {
                await testOne(i, Ether);
            }
            await testOne(supply, Ether);
        });

        // it("验证 计算方程 的 溢出问题", async () => {
        //     let signers = await ethers.getSigners()
        //     let buyer = signers[Id.Buyer]
        //     const BondingCurve = await ethers.getContractFactory(calculatorContract)
        //     const curve = await BondingCurve.deploy(a, b)
        //     await curve.deployed()
        //     const curveAbi = ExpMixedBondingSwap__factory.connect(curve.address,buyer)

        //     expect(curveAbi.calculateMintAmountFromBondingCurve(Wei.shl(200), Wei)).to.be.reverted
        //     expect(curveAbi.calculateMintAmountFromBondingCurve(Wei, Wei.shl(200))).to.be.reverted
        //     expect(curveAbi.calculateBurnAmountFromBondingCurve(1, 10)).to.be.reverted
        // })
    });
});
