import { expect } from "chai";
import { ethers, network } from "hardhat";
import { defines } from "../../hardhat.config";
import { HotpotERC20Mixed__factory } from "../../typechain";

const hre = require("hardhat");
const Ether = defines.Unit.Ether;
const Id = defines.Id;

describe("验证 Mint Cap 铸造限制", async () => {
    describe("Exp Mixed Hotpot Token", async () => {
        it("校验 mint 方法 铸造上限", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            await network.provider.send("hardhat_setBalance", [
                buyer.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);

            const token = await hre.expToken(500, 1000, false, Ether.mul(10000));
            const hotpotTokenAbi = await HotpotERC20Mixed__factory.connect(token.address, buyer);

            let price = await hotpotTokenAbi.price();
            // mint 1 eth
            await expect(
                hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: price }),
                "铸造量少于 mintCap 时需要铸造成功"
            ).not.reverted;
            await expect(
                hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: price.mul(100000) }),
                "铸造量大于 mintCap 时不会铸造失败"
            ).not.reverted;
        });
    });
});
