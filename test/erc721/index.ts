import { expect } from "chai";
import { formatEther } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { defines } from "../../hardhat.config";
import { ExpMixedBondingSwap__factory, HotpotERC20Mixed__factory } from "../../typechain";

const hre = require("hardhat");
const Ether = defines.Unit.Ether;
const Wei = defines.Unit.Wei;
const GWei = defines.Unit.GWei;
const Id = defines.Id;

const round = 10;
const a = 14;
const b = 2e6;
const data = hre.ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [a, b]);
describe("ERC721", async () => {
    describe("单例测试测试", async () => {
        let calculatorContract = "ExpMixedBondingSwap";
        let supply = Ether.mul(1e7);
        // let supply = Ether.mul(a).mul(b)
        let px = Ether.div(1000);
        let tvl = Ether.mul(2000);

        it("验证 mint 最小铸造", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];

            const token = await hre.expToken(100, 100, true);
            const hotpotTokenAbi = await HotpotERC20Mixed__factory.connect(token.address, buyer);

            await network.provider.send("hardhat_setBalance", [treasury.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [platform.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [
                buyer.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);
            const getNativeToken = async (amount) => {
                const [_, nativeTokenAmount, fee1, fee2] = await hotpotTokenAbi.estimateMintNeed(amount);
                return nativeTokenAmount.add(fee1).add(fee2);
            };
            const native = await getNativeToken(1);
            await expect(
                hotpotTokenAbi
                    .connect(buyer)
                    .mint(buyer.address, (await hotpotTokenAbi.estimateMint(native)).daoTokenAmount.add(1), {
                        value: native,
                    }),
                "小于最小铸造期望时 铸造失败"
            ).to.reverted;
            await expect(
                hotpotTokenAbi
                    .connect(buyer)
                    .mint(buyer.address, (await hotpotTokenAbi.estimateMint(native)).daoTokenAmount, {
                        value: native,
                    }),
                "大于最小铸造期望时 铸造成功"
            ).not.reverted;
            let erc20Balance = await hotpotTokenAbi.balanceOf(buyer.address);
            let estimiteBurn = await hotpotTokenAbi.estimateBurn(erc20Balance);
            await expect(
                hotpotTokenAbi.connect(buyer).burn(buyer.address, erc20Balance, estimiteBurn.nativeTokenAmount.add(1)),
                "小于最小销毁期望payback时 销毁失败"
            ).to.reverted;
            await expect(
                hotpotTokenAbi.connect(buyer).burn(buyer.address, 0, estimiteBurn.nativeTokenAmount),
                "大于最小销毁期望payback时 销毁成功"
            ).not.reverted;
        });
        it("样例 mint 与 burn 方法 个人单买多轮", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];
            const token = await hre.expToken(100, 100, true);
            const hotpotTokenAbi = await HotpotERC20Mixed__factory.connect(token.address, buyer);

            await network.provider.send("hardhat_setBalance", [treasury.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [platform.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [
                buyer.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);

            const getNativeToken = async (amount) => {
                const [_, nativeTokenAmount, fee1, fee2] = await hotpotTokenAbi.estimateMintNeed(amount);
                return nativeTokenAmount.add(fee1).add(fee2);
            };
            const native = await getNativeToken(1);
            for (let i = 0; i < round; i++) {
                let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: native });
                await mintTx1.wait();
                let platformBalance = await platform.getBalance();
                let treasuryBalance = await treasury.getBalance();
                let contractAsset = await ethers.provider.getBalance(hotpotTokenAbi.address);
                let buyerBalance = await buyer.getBalance();
                let erc20Balance = await hotpotTokenAbi.balanceOf(buyer.address);
                let estimateBurn = await hotpotTokenAbi.estimateBurn(i + 1);
                let price = await hotpotTokenAbi.price();
                console.log(
                    "平台eth余额",
                    ethers.utils.formatEther(platformBalance),
                    "国库eth余额",
                    ethers.utils.formatEther(treasuryBalance),
                    "合约eth资产",
                    ethers.utils.formatEther(contractAsset),
                    "价格eth/erc20",
                    ethers.utils.formatEther(price),
                    "\n",
                    "BUYER eth 余额",
                    ethers.utils.formatEther(buyerBalance),
                    "BUYER erc20 余额",
                    erc20Balance.toNumber(),
                    "BUYER eth 可兑取",
                    ethers.utils.formatEther(
                        estimateBurn.nativeTokenAmount.add(estimateBurn.platformFee.add(estimateBurn.projectFee))
                    ),
                    "误差损失 eth wei",
                    contractAsset
                        .sub(estimateBurn.nativeTokenAmount.add(estimateBurn.platformFee.add(estimateBurn.projectFee)))
                        .toString(),
                    "\n"
                );
                // expect(
                //     contractAsset.sub(
                //         estimateBurn.nativeTokenAmount.add(estimateBurn.platformFee.add(estimateBurn.projectFee))
                //     ),
                //     "误差损失当线性增长"
                // ).to.lt(Wei.mul(1000 * (round + 2)));
            }
        });

        it("样例 mint 与 burn 方法 个人单卖多轮", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];
            const token = await hre.linearToken(100, 100, true);
            const hotpotTokenAbi = await HotpotERC20Mixed__factory.connect(token.address, buyer);

            await network.provider.send("hardhat_setBalance", [treasury.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [platform.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [
                buyer.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);
            const getNativeToken = async (amount) => {
                const [_, nativeTokenAmount, fee1, fee2] = await hotpotTokenAbi.estimateMintNeed(amount);
                return nativeTokenAmount.add(fee1).add(fee2);
            };
            let tokenId = 10;
            const native = await getNativeToken(tokenId);
            let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: native });
            await mintTx1.wait();
            let totalErc20Balance = await hotpotTokenAbi.balanceOf(buyer.address);
            for (let i = 0; i < round; i++) {
                let platformBalance = await platform.getBalance();
                let treasuryBalance = await treasury.getBalance();
                let contractAsset = await ethers.provider.getBalance(hotpotTokenAbi.address);
                let buyerBalance = await buyer.getBalance();
                let erc20Balance = await hotpotTokenAbi.balanceOf(buyer.address);
                let estimateBurn = await hotpotTokenAbi.estimateBurn(--tokenId);
                let price = await hotpotTokenAbi.price();
                console.log(
                    "平台eth余额",
                    ethers.utils.formatEther(platformBalance),
                    "国库eth余额",
                    ethers.utils.formatEther(treasuryBalance),
                    "合约eth资产",
                    ethers.utils.formatEther(contractAsset),
                    "价格eth/erc20",
                    ethers.utils.formatEther(price),
                    "\n",
                    "BUYER eth 余额",
                    ethers.utils.formatEther(buyerBalance),
                    "BUYER erc20 余额",
                    erc20Balance.toNumber(),
                    "BUYER eth 可兑取",
                    ethers.utils.formatEther(
                        estimateBurn.nativeTokenAmount.add(estimateBurn.platformFee.add(estimateBurn.projectFee))
                    ),
                    "误差损失 eth wei",
                    contractAsset
                        .sub(estimateBurn.nativeTokenAmount.add(estimateBurn.platformFee.add(estimateBurn.projectFee)))
                        .toString(),
                    "\n"
                );
                // expect(
                //     contractAsset.sub(
                //         estimateBurn.nativeTokenAmount.add(estimateBurn.platformFee.add(estimateBurn.projectFee))
                //     ),
                //     "误差损失当线性增长"
                // ).to.lt(Wei.mul(1000 * (round + 2)));
                let burnTx2 = await hotpotTokenAbi.connect(buyer).burn(buyer.address, tokenId, 0);
                await burnTx2.wait();
            }
        });

        it("样例 大规模 mint 与 burn 方法 买卖混合多轮测试", async () => {
            let signers = await ethers.getSigners();
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];
            let buyer1 = signers[Id.Buyer1];
            let buyer2 = signers[Id.Buyer2];
            let buyer3 = signers[Id.Buyer3];

            const token = await hre.expToken(100, 100, true);
            const hotpotTokenAbi = await HotpotERC20Mixed__factory.connect(token.address, buyer1);

            await network.provider.send("hardhat_setBalance", [treasury.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [platform.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [
                buyer1.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);
            await network.provider.send("hardhat_setBalance", [
                buyer2.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);
            await network.provider.send("hardhat_setBalance", [
                buyer3.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);

            const getNativeToken = async (amount) => {
                const [_, nativeTokenAmount, fee1, fee2] = await hotpotTokenAbi.estimateMintNeed(amount);
                return nativeTokenAmount.add(fee1).add(fee2);
            };
            for (let i = 0; i < round; i++) {
                // buyer 1 只买不卖 1~99 ether
                // buyer 3 买了随机转给 buyer 2
                let mintTx1 = await hotpotTokenAbi
                    .connect(buyer1)
                    .mint(buyer1.address, 0, { value: await getNativeToken(Math.floor(Math.random() * 49) + 1) });
                await mintTx1.wait();
                // buyer 2 即买又卖一部分
                let mintTx2 = await hotpotTokenAbi
                    .connect(buyer2)
                    .mint(buyer2.address, 0, { value: await getNativeToken(Math.floor(Math.random() * 999) + 1) });
                await mintTx2.wait();
                let buyer2Erc20 = await hotpotTokenAbi.balanceOf(buyer2.address);
                let burnTx2 = await hotpotTokenAbi
                    .connect(buyer2)
                    .burn(buyer2.address, buyer2Erc20.mul(Math.floor(Math.random() * 99) + 1).div(100), 0);
                await burnTx2.wait();
                // buyer 3 随机买大单，并随机往 buyer 2，buyer 3 中转入
                // buyer 3 会触发随机的抛出动作
                if (Math.random() < 0.5) {
                    let mintTx3 = await hotpotTokenAbi
                        .connect(buyer3)
                        .mint(buyer2.address, 0, { value: Ether.mul(Math.floor(Math.random() * 900) + 100) });
                    await mintTx3.wait();
                } else {
                    let mintTx3 = await hotpotTokenAbi
                        .connect(buyer3)
                        .mint(buyer3.address, 0, { value: Ether.mul(Math.floor(Math.random() * 900) + 100) });
                    await mintTx3.wait();
                }
                if (Math.random() < 0.1) {
                    let buyer3Erc20 = await hotpotTokenAbi.balanceOf(buyer3.address);
                    if (buyer3Erc20.gt(Ether)) {
                        let burnTx3 = await hotpotTokenAbi
                            .connect(buyer3)
                            .burn(buyer3.address, buyer3Erc20.mul(Math.floor(Math.random() * 99) + 1).div(100), 0);
                        await burnTx3.wait();
                    }
                }
                let platformBalance = await platform.getBalance();
                let treasuryBalance = await treasury.getBalance();
                let contractAsset = await ethers.provider.getBalance(hotpotTokenAbi.address);
                let contractTotalSupply = await hotpotTokenAbi.totalSupply();
                let estimateBurn = await hotpotTokenAbi.estimateBurn(contractTotalSupply);
                let price = await hotpotTokenAbi.price();
                let buyer1Native = await buyer1.getBalance();
                let buyer1Erc20 = await hotpotTokenAbi.balanceOf(buyer1.address);
                let buyer2Native = await buyer2.getBalance();
                buyer2Erc20 = await hotpotTokenAbi.balanceOf(buyer2.address);
                let buyer3Native = await buyer3.getBalance();
                let buyer3Erc20 = await hotpotTokenAbi.balanceOf(buyer3.address);
                console.log(
                    "平台eth余额",
                    ethers.utils.formatEther(platformBalance),
                    "国库eth余额",
                    ethers.utils.formatEther(treasuryBalance),
                    "合约erc20supply",
                    ethers.utils.formatEther(contractTotalSupply),
                    "合约eth资产",
                    ethers.utils.formatEther(contractAsset),
                    "eth 可兑取",
                    ethers.utils.formatEther(
                        estimateBurn.nativeTokenAmount.add(estimateBurn.platformFee.add(estimateBurn.projectFee))
                    ),
                    "误差损失 eth wei",
                    contractAsset
                        .sub(estimateBurn.nativeTokenAmount.add(estimateBurn.platformFee.add(estimateBurn.projectFee)))
                        .toString(),
                    "价格eth/erc20",
                    ethers.utils.formatEther(price),
                    "\n",
                    "BUYER 1 eth 余额",
                    ethers.utils.formatEther(buyer1Native),
                    "erc20 余额",
                    ethers.utils.formatEther(buyer1Erc20),
                    "\n",
                    "BUYER 2 eth 余额",
                    ethers.utils.formatEther(buyer2Native),
                    "erc20 余额",
                    ethers.utils.formatEther(buyer2Erc20),
                    "\n",
                    "BUYER 3 eth 余额",
                    ethers.utils.formatEther(buyer3Native),
                    "erc20 余额",
                    ethers.utils.formatEther(buyer3Erc20),
                    "\n"
                );
                expect(
                    contractAsset.sub(
                        estimateBurn.nativeTokenAmount.add(estimateBurn.platformFee.add(estimateBurn.projectFee))
                    ),
                    "误差损失当线性增长"
                ).to.lt(Wei.mul(1000 * (round + 2)));
            }
        });
    });
});