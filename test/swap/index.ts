import { expect } from "chai";
import { BigNumber, constants } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { defines } from "../../hardhat.config";
import { HotpotERC20Mixed__factory, HotpotERC721Mixed__factory, TestErc20, TestErc20__factory } from "../../typechain";

const hre = require("hardhat");
const Ether = defines.Unit.Ether;
const Wei = defines.Unit.Wei;
const GWei = defines.Unit.GWei;
const Id = defines.Id;

const round = 10;
const a = 14;
const b = 2e6;
const data = hre.ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [a, b]);
describe("swap", async () => {
    let mockToken: TestErc20;

    const cliamERC20 = async (to, amount) => {
        await mockToken.transfer(to, amount);
    };
    beforeEach(async () => {
        if (!mockToken) {
            let signers = await ethers.getSigners();
            let mockTokenFactory = await hre.ethers.getContractFactory("TestErc20");
            mockToken = TestErc20__factory.connect((await mockTokenFactory.deploy()).address, signers[0]);
        }
    });
    describe("单例测试测试", async () => {
        it("验证 swap", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];

            const token = await hre.linearToken(100, 100, false, false);
            const token2 = await hre.linearToken(100, 100, false, false);
            const token3 = await hre.linearToken(100, 100, false, false, mockToken.address);
            const tokenA = await HotpotERC20Mixed__factory.connect(token.address, buyer);
            const tokenB = await HotpotERC20Mixed__factory.connect(token2.address, buyer);
            const tokenC = await HotpotERC20Mixed__factory.connect(token3.address, buyer);
            // await cliamERC20(buyer.address, parseEther("1"));
            // await mockToken.connect(buyer).approve(tokenA.address, parseEther("10000"));
            await tokenA.mint(buyer.address, parseEther("1"), 0, { value: parseEther("1") });
            const routeContract = await ethers.getContractFactory("HotpotRoute");
            const route = await routeContract.deploy();
            const tokenABalance = await tokenA.balanceOf(buyer.address);
            const amountOut = await route.getAmountOut(tokenA.address, tokenB.address, tokenABalance);
            await tokenA.approve(route.address, tokenABalance);
            await route.swap(
                tokenA.address,
                tokenB.address,
                tokenABalance,
                amountOut.returnAmount,
                buyer.address,
                99999999999
            );
            const tokenBBalance = await tokenB.balanceOf(buyer.address);
            const tokenARouteBalance = await tokenA.balanceOf(route.address);
            const tokenBRouteBalance = await tokenB.balanceOf(route.address);
            expect(tokenBBalance).eq(amountOut.returnAmount, "should be the same");
            expect(tokenARouteBalance).eq(tokenBRouteBalance).eq(BigNumber.from(0));
            await expect(route.getAmountOut(tokenB.address, tokenC.address, tokenBBalance)).revertedWith(
                "not the same raising token"
            );
        });
    });
});
