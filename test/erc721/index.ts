import { expect } from "chai";
import { formatEther } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { defines } from "../../hardhat.config";
import { HotpotERC721Mixed__factory } from "../../typechain";

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
        it("验证 mint 最小铸造", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];

            const token = await hre.linearToken(100, 100, true);
            const hotpotTokenAbi = await HotpotERC721Mixed__factory.connect(token.address, buyer);

            await network.provider.send("hardhat_setBalance", [treasury.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [platform.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [
                buyer.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);
            const getNativeToken = async (amount) => {
                const [_, amountReturn, fee1, fee2] = await hotpotTokenAbi.estimateMintNeed(amount);
                return amountReturn;
            };
            const native = await getNativeToken(1);
            await expect(
                hotpotTokenAbi
                    .connect(buyer)
                    .mint(buyer.address, native, (await hotpotTokenAbi.estimateMint(native)).receivedAmount.add(1), {
                        value: native,
                    }),
                "小于最小铸造期望时 铸造失败"
            ).to.reverted;
            await expect(
                hotpotTokenAbi
                    .connect(buyer)
                    .mint(buyer.address, native, (await hotpotTokenAbi.estimateMint(native)).receivedAmount, {
                        value: native.add(1e9),
                    }),
                "大于最小铸造期望时 铸造成功"
            ).not.reverted;
            let erc721Balance = await hotpotTokenAbi.balanceOf(buyer.address);
            let estimiteBurn = await hotpotTokenAbi.estimateBurn(erc721Balance);
            await expect(
                hotpotTokenAbi.connect(buyer).burn(buyer.address, erc721Balance, estimiteBurn.amountReturn.add(1)),
                "小于最小销毁期望payback时 销毁失败"
            ).to.reverted;
            await expect(
                hotpotTokenAbi.connect(buyer).burn(buyer.address, 0, estimiteBurn.amountReturn),
                "大于最小销毁期望payback时 销毁成功"
            ).not.reverted;
        });
        it("样例 mint 与 burn 方法 个人单买多轮", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];
            const token = await hre.linearToken(100, 100, true);
            const hotpotTokenAbi = await HotpotERC721Mixed__factory.connect(token.address, buyer);

            await network.provider.send("hardhat_setBalance", [treasury.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [platform.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [
                buyer.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);

            for (let i = 0; i < round; i++) {
                const getNativeToken = async (amount) => {
                    const [_, amountReturn, fee1, fee2] = await hotpotTokenAbi.estimateMintNeed(amount);
                    return amountReturn.add(fee1).add(fee2);
                };
                const native = await getNativeToken(1);
                let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, native, 0, { value: native });
                await mintTx1.wait();
                let platformBalance = await platform.getBalance();
                let treasuryBalance = await treasury.getBalance();
                let contractAsset = await ethers.provider.getBalance(hotpotTokenAbi.address);
                let buyerBalance = await buyer.getBalance();
                let erc721Balance = await hotpotTokenAbi.balanceOf(buyer.address);
                let estimateBurn = await hotpotTokenAbi.estimateBurn(i + 1);
                let price = await hotpotTokenAbi.price();
                console.log(
                    "平台eth余额",
                    ethers.utils.formatEther(platformBalance),
                    "国库eth余额",
                    ethers.utils.formatEther(treasuryBalance),
                    "合约eth资产",
                    ethers.utils.formatEther(contractAsset),
                    "价格eth/erc721",
                    ethers.utils.formatEther(price),
                    "\n",
                    "BUYER eth 余额",
                    ethers.utils.formatEther(buyerBalance),
                    "BUYER erc721 余额",
                    erc721Balance.toNumber(),
                    "BUYER eth 可兑取",
                    ethers.utils.formatEther(
                        estimateBurn.amountReturn.add(estimateBurn.platformFee.add(estimateBurn.projectFee))
                    ),
                    "误差损失 eth wei",
                    contractAsset
                        .sub(estimateBurn.amountReturn.add(estimateBurn.platformFee.add(estimateBurn.projectFee)))
                        .toString(),
                    "\n"
                );
                // expect(
                //     contractAsset.sub(
                //         estimateBurn.amountReturn.add(estimateBurn.platformFee.add(estimateBurn.projectFee))
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
            const hotpotTokenAbi = await HotpotERC721Mixed__factory.connect(token.address, buyer);

            await network.provider.send("hardhat_setBalance", [treasury.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [platform.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [
                buyer.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);
            const getNativeToken = async (amount) => {
                const [_, amountReturn, fee1, fee2] = await hotpotTokenAbi.estimateMintNeed(amount);
                return amountReturn.add(fee1).add(fee2);
            };
            let tokenId = 10;
            const native = await getNativeToken(tokenId);
            let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, native, 0, { value: native });
            await mintTx1.wait();
            let totalErc721Balance = await hotpotTokenAbi.balanceOf(buyer.address);
            for (let i = 0; i < round; i++) {
                let platformBalance = await platform.getBalance();
                let treasuryBalance = await treasury.getBalance();
                let contractAsset = await ethers.provider.getBalance(hotpotTokenAbi.address);
                let buyerBalance = await buyer.getBalance();
                let erc721Balance = await hotpotTokenAbi.balanceOf(buyer.address);
                let estimateBurn = await hotpotTokenAbi.estimateBurn(--tokenId);
                let price = await hotpotTokenAbi.price();
                console.log(
                    "平台eth余额",
                    ethers.utils.formatEther(platformBalance),
                    "国库eth余额",
                    ethers.utils.formatEther(treasuryBalance),
                    "合约eth资产",
                    ethers.utils.formatEther(contractAsset),
                    "价格eth/erc721",
                    ethers.utils.formatEther(price),
                    "\n",
                    "BUYER eth 余额",
                    ethers.utils.formatEther(buyerBalance),
                    "BUYER erc721 余额",
                    erc721Balance.toNumber(),
                    "BUYER eth 可兑取",
                    ethers.utils.formatEther(
                        estimateBurn.amountReturn.add(estimateBurn.platformFee.add(estimateBurn.projectFee))
                    ),
                    "误差损失 eth wei",
                    contractAsset
                        .sub(estimateBurn.amountReturn.add(estimateBurn.platformFee.add(estimateBurn.projectFee)))
                        .toString(),
                    "\n"
                );
                // expect(
                //     contractAsset.sub(
                //         estimateBurn.amountReturn.add(estimateBurn.platformFee.add(estimateBurn.projectFee))
                //     ),
                //     "误差损失当线性增长"
                // ).to.lt(Wei.mul(1000 * (round + 2)));
                let burnTx2 = await hotpotTokenAbi.connect(buyer).burn(buyer.address, tokenId, 0);
                await burnTx2.wait();
            }
        });

        it("ERC721 样例 大规模 mint 与 burn 方法 买卖混合多轮测试", async () => {
            let signers = await ethers.getSigners();
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];
            let buyer1 = signers[Id.Buyer1];
            let buyer2 = signers[Id.Buyer2];
            let buyer3 = signers[Id.Buyer3];

            const token = await hre.linearToken(100, 100, true);
            const hotpotTokenAbi = await HotpotERC721Mixed__factory.connect(token.address, buyer1);

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
                const [_, amountReturn, fee1, fee2] = await hotpotTokenAbi.estimateMintNeed(amount);
                return amountReturn;
            };
            for (let i = 0; i < round; i++) {
                // buyer 1 只买不卖 1~99 ether
                // buyer 3 买了随机转给 buyer 2
                const amount1 = await getNativeToken(Math.floor(Math.random() * 0.0) + 1);
                let mintTx1 = await hotpotTokenAbi.connect(buyer1).mint(buyer1.address, amount1, 0, { value: amount1 });
                await mintTx1.wait();
                // buyer 2 即买又卖一部分
                const amount2 = await getNativeToken(Math.floor(Math.random() * 0.0) + 1);
                let mintTx2 = await hotpotTokenAbi.connect(buyer2).mint(buyer2.address, amount2, 0, { value: amount2 });
                await mintTx2.wait();
                let buyer2Erc721 = await hotpotTokenAbi.balanceOf(buyer2.address);
                // buyer 3 随机买大单，并随机往 buyer 2，buyer 3 中转入
                const amount3 = await getNativeToken(Math.floor(Math.random() * 0.0) + 1);
                if (Math.random() < 0.5) {
                    let mintTx3 = await hotpotTokenAbi.connect(buyer3).mint(buyer2.address, amount3, 0, { value: amount3 });
                    await mintTx3.wait();
                }
                // 会触发随机的抛出动作
                if (Math.random() < 0.1) {
                    let contractTotalSupply = await hotpotTokenAbi.totalSupply();
                    for (let i = 0; contractTotalSupply.gt(i); i++) {
                        if (Math.random() > 0.1) continue;
                        else {
                            let owner = await hotpotTokenAbi.ownerOf(i);
                            if (owner == "0x0000000000000000000000000000000000000000") continue;
                            let burnTx = await hotpotTokenAbi
                                .connect(signers.find((e) => e.address == owner))
                                .burn(owner, i, 0);
                            await burnTx.wait();
                        }
                    }
                }
                let platformBalance = await platform.getBalance();
                let treasuryBalance = await treasury.getBalance();
                let contractAsset = await ethers.provider.getBalance(hotpotTokenAbi.address);
                let contractTotalSupply = await hotpotTokenAbi.totalSupply();
                let estimateBurn = await hotpotTokenAbi.estimateBurn(contractTotalSupply);
                let price = await hotpotTokenAbi.price();
                let buyer1Native = await buyer1.getBalance();
                let buyer1Erc721 = await hotpotTokenAbi.balanceOf(buyer1.address);
                let buyer2Native = await buyer2.getBalance();
                buyer2Erc721 = await hotpotTokenAbi.balanceOf(buyer2.address);
                let buyer3Native = await buyer3.getBalance();
                let buyer3Erc721 = await hotpotTokenAbi.balanceOf(buyer3.address);
                console.log(
                    "平台eth余额",
                    ethers.utils.formatEther(platformBalance),
                    "国库eth余额",
                    ethers.utils.formatEther(treasuryBalance),
                    "合约erc721supply",
                    contractTotalSupply.toString(),
                    "合约eth资产",
                    ethers.utils.formatEther(contractAsset),
                    "eth 可兑取",
                    ethers.utils.formatEther(
                        estimateBurn.amountReturn.add(estimateBurn.platformFee.add(estimateBurn.projectFee))
                    ),
                    "误差损失 eth wei",
                    contractAsset
                        .sub(estimateBurn.amountReturn.add(estimateBurn.platformFee.add(estimateBurn.projectFee)))
                        .toString(),
                    "价格eth/erc721",
                    ethers.utils.formatEther(price),
                    "\n",
                    "BUYER 1 eth 余额",
                    ethers.utils.formatEther(buyer1Native),
                    "erc721 余额",
                    buyer1Erc721.toString(),
                    "\n",
                    "BUYER 2 eth 余额",
                    ethers.utils.formatEther(buyer2Native),
                    "erc721 余额",
                    buyer2Erc721.toString(),
                    "\n",
                    "BUYER 3 eth 余额",
                    ethers.utils.formatEther(buyer3Native),
                    "erc721 余额",
                    buyer3Erc721.toString(),
                    "\n"
                );
                expect(
                    contractAsset.sub(estimateBurn.amountReturn.add(estimateBurn.platformFee.add(estimateBurn.projectFee))),
                    "误差损失当线性增长"
                ).to.lt(Wei.mul(1000 * (round + 2)));
            }
        });
    });
});
