import { expect } from "chai";
import { ethers, network } from "hardhat";
import { defines } from "../../hardhat.config";
import { HotpotERC20Mixed__factory, HotpotTokenFactory__factory } from "../../typechain";

const hre = require("hardhat");
const Ether = defines.Unit.Ether;
const Id = defines.Id;

describe("验证 Pausable 暂停功能", async () => {
    describe("Exp Mixed Hotpot Token", async () => {
        it("校验 pause 功能", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];

            await network.provider.send("hardhat_setBalance", [
                buyer.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);
            await network.provider.send("hardhat_setBalance", [treasury.address, Ether._hex.replace(/0x0+/, "0x")]);
            await network.provider.send("hardhat_setBalance", [platform.address, Ether._hex.replace(/0x0+/, "0x")]);
            const token = await hre.expToken(500, 1000);
            const hotpotTokenAbi = await HotpotERC20Mixed__factory.connect(token.address, buyer);
            const factoryAbi = await HotpotTokenFactory__factory.connect(hre.factory.address, platform);

            let tx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, Ether.mul(10), 0, { value: Ether.mul(10) });
            await tx1.wait();

            await expect(factoryAbi.connect(treasury).pause(hotpotTokenAbi.address), "非 platform 用户不可调用 pause 功能").to
                .reverted;
            await expect(
                factoryAbi.connect(treasury).unpause(hotpotTokenAbi.address),
                "非 platform 用户不可调用 unpause 功能"
            ).to.reverted;
            await expect(factoryAbi.connect(buyer).pause(hotpotTokenAbi.address), "非 platform 用户不可调用 pause 功能").to
                .reverted;
            await expect(factoryAbi.connect(buyer).unpause(hotpotTokenAbi.address), "非 platform 用户不可调用 unpause 功能")
                .to.reverted;

            await expect(hotpotTokenAbi.connect(treasury).pause(), "any 用户 不可直接调用 factory 的 pause 功能").to.reverted;
            await expect(hotpotTokenAbi.connect(treasury).unpause(), "any 用户 不可直接调用 factory 的 unpause 功能").to
                .reverted;
            await expect(hotpotTokenAbi.connect(platform).pause(), "any 用户 不可直接调用 factory 的 pause 功能").to.reverted;
            await expect(hotpotTokenAbi.connect(platform).unpause(), "any 用户 不可直接调用 factory 的 unpause 功能").to
                .reverted;

            expect(await hotpotTokenAbi.connect(buyer).paused(), "pause 前 paused 应当为 false").to.false;
            // await expect(hotpotTokenAbi.connect(treasury).pause().then(async tx=>{ await tx.wait()}),'treasury 用户需要调用 pause 功能成功').not.reverted
            let tx2 = await factoryAbi.connect(platform).pause(hotpotTokenAbi.address);
            await tx2.wait();

            expect(await hotpotTokenAbi.paused(), "pause 后 paused 应当为 true").to.true;

            let erc20Balance = await hotpotTokenAbi.balanceOf(buyer.address);
            await expect(
                hotpotTokenAbi.connect(buyer).mint(buyer.address, Ether.mul(10), 0, { value: Ether.mul(10) }),
                "暂停后 不能mint"
            ).to.reverted;
            await expect(hotpotTokenAbi.connect(buyer).burn(buyer.address, erc20Balance, 0), "暂停后 不能burn").to.reverted;
            await expect(hotpotTokenAbi.connect(buyer).transfer(buyer.address, erc20Balance), "暂停后 不能transfer").to
                .reverted;

            let tx3 = await factoryAbi.connect(platform).unpause(hotpotTokenAbi.address);
            await tx3.wait();

            expect(await hotpotTokenAbi.paused(), "unpause 后 paused 应当为 false").to.false;

            await expect(hotpotTokenAbi.connect(buyer).transfer(treasury.address, "100"), "取消暂停后 可以转账").not.reverted;

            await expect(
                hotpotTokenAbi.connect(buyer).mint(buyer.address, Ether.mul(10), 0, { value: Ether.mul(10) }),
                "取消暂停后 可以铸造"
            ).not.reverted;

            await expect(hotpotTokenAbi.connect(buyer).burn(buyer.address, erc20Balance.div(2), 0), "取消暂停后 可以销毁").not
                .reverted;
        });
    });
});
