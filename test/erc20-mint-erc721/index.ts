import { expect } from "chai";
import { constants } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { defines } from "../../hardhat.config";
import { HotpotERC721Mixed__factory, TestErc20, TestErc20__factory } from "../../typechain";

const hre = require("hardhat");
const Ether = defines.Unit.Ether;
const Wei = defines.Unit.Wei;
const GWei = defines.Unit.GWei;
const Id = defines.Id;

const round = 10;
const a = 14;
const b = 2e6;
const data = hre.ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [a, b]);
describe("ERC20 mint ERC721", async () => {
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
        it("验证 mint", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];

            const token = await hre.linearToken(100, 100, true, false, mockToken.address);
            const hotpotTokenAbi = await HotpotERC721Mixed__factory.connect(token.address, buyer);

            await network.provider.send("hardhat_setBalance", [treasury.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [platform.address, "0x0"]);
            await network.provider.send("hardhat_setBalance", [
                buyer.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);
            const getNativeToken = async (amount) => {
                return await hotpotTokenAbi.estimateMintNeed(amount);
            };
            let [_, native, platformFee, projectFee] = await getNativeToken(1);
            await expect(hotpotTokenAbi.connect(buyer).mint(buyer.address, native, 0), "没有approve前铸造失败").to.reverted;
            await mockToken.approve(hotpotTokenAbi.address, constants.MaxUint256);
            await expect(hotpotTokenAbi.connect(buyer).mint(buyer.address, native, 0), "approve后铸造成本").to.not.reverted;
            expect(await mockToken.balanceOf(treasury.address)).eq(projectFee);
            expect(await mockToken.balanceOf(platform.address)).eq(platformFee);

            [_, native, platformFee, projectFee] = await hotpotTokenAbi.estimateBurn(0);
            await hotpotTokenAbi.burn(signers[signers.length - 1].address, 0, 0);
            expect(await mockToken.balanceOf(signers[signers.length - 1].address)).eq(native);
        });
    });
});
