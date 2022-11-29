import { expect } from "chai";
import { ethers, network } from "hardhat";
import { defines } from "../../hardhat.config";
import { HotpotERC20Mixed__factory, HotpotTokenFactory__factory } from "../../typechain";

const hre = require("hardhat");
const Ether = defines.Unit.Ether;
const Id = defines.Id;

describe("验证 Factory 权限", async () => {
    describe("Mixed Hotpot Token", async () => {
        it("校验 权限 管理", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];
            let premintRole = signers[Id.Buyer2];

            await network.provider.send("hardhat_setBalance", [
                buyer.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);
            await network.provider.send("hardhat_setBalance", [treasury.address, Ether._hex.replace(/0x0+/, "0x")]);
            await network.provider.send("hardhat_setBalance", [platform.address, Ether._hex.replace(/0x0+/, "0x")]);
            const token = await hre.expToken(500, 1000);
            const hotpotTokenAbi = await HotpotERC20Mixed__factory.connect(token.address, buyer);

            expect(
                await hotpotTokenAbi.hasRole(await hotpotTokenAbi.FACTORY_ROLE(), hre.factory.address),
                "工厂 拥有 Factory 权限"
            ).to.true;
            expect(
                await hotpotTokenAbi.hasRole(await hotpotTokenAbi.PROJECT_ADMIN_ROLE(), hre.factory.address),
                "工厂 不拥有 项目管理员 权限"
            ).to.false;

            expect(
                await hotpotTokenAbi.hasRole(await hotpotTokenAbi.FACTORY_ROLE(), platform.address),
                "Platform 不拥有 Factory 权限"
            ).to.false;
            expect(
                await hotpotTokenAbi.hasRole(await hotpotTokenAbi.PROJECT_ADMIN_ROLE(), platform.address),
                "Platform 不拥有 项目管理员 权限"
            ).to.false;

            expect(
                await hotpotTokenAbi.hasRole(await hotpotTokenAbi.PROJECT_ADMIN_ROLE(), treasury.address),
                "Treaury 拥有 Project Admin权限"
            ).to.true;
            expect(
                await hotpotTokenAbi.hasRole(await hotpotTokenAbi.PROJECT_ADMIN_ROLE(), treasury.address),
                "Treaury 拥有 Project Manager权限"
            ).to.true;
            expect(
                await hotpotTokenAbi.hasRole(await hotpotTokenAbi.FACTORY_ROLE(), treasury.address),
                "Treaury 不拥有 Factory 权限"
            ).to.false;

            await expect(
                hotpotTokenAbi.connect(treasury).grantRole(await hotpotTokenAbi.FACTORY_ROLE(), premintRole.address),
                "工厂权限 不可被授权"
            ).to.reverted;
            await expect(
                hotpotTokenAbi.connect(treasury).grantRole(await hotpotTokenAbi.PROJECT_ADMIN_ROLE(), premintRole.address),
                "ProjectAdmin 权限 不可被授权"
            ).to.reverted;

            await expect(
                hotpotTokenAbi.connect(platform).setProjectTreasury(buyer.address),
                "非 platformAdmin 无法转移 treasury"
            ).to.reverted;
            await expect(
                hotpotTokenAbi.connect(treasury).setProjectAdmin(buyer.address),
                "platformAdmin 可以转移 treasury 角色"
            ).not.reverted;
            expect(
                await hotpotTokenAbi.hasRole(await hotpotTokenAbi.PROJECT_ADMIN_ROLE(), buyer.address),
                "重置 treasury 后 新的 treasury 有了 ProjectAdmin 权限"
            ).to.true;
            expect(
                await hotpotTokenAbi.hasRole(await hotpotTokenAbi.PROJECT_ADMIN_ROLE(), treasury.address),
                "重置 treasury 后 老的 treasury 不再拥有 ProjectAdmin 权限"
            ).to.false;
        });
    });

    describe("Factory", async () => {
        it("校验 权限 管理", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];
            let premintRole = signers[Id.Buyer2];

            await network.provider.send("hardhat_setBalance", [
                buyer.address,
                Ether.mul(100000000)._hex.replace(/0x0+/, "0x"),
            ]);
            await network.provider.send("hardhat_setBalance", [treasury.address, Ether._hex.replace(/0x0+/, "0x")]);
            await network.provider.send("hardhat_setBalance", [platform.address, Ether._hex.replace(/0x0+/, "0x")]);
            const token = await hre.expToken(500, 1000);
            const hotpotTokenAbi = await HotpotERC20Mixed__factory.connect(token.address, buyer);
            const factoryAbi = await HotpotTokenFactory__factory.connect(hre.factory.address, platform);

            expect(
                await factoryAbi.hasRole(await factoryAbi.DEFAULT_ADMIN_ROLE(), platform.address),
                "anyone 都没有 DEFAULT_ADMIN_ROLE 权限"
            ).to.false;
            expect(
                await factoryAbi.hasRole(await factoryAbi.DEFAULT_ADMIN_ROLE(), treasury.address),
                "anyone 都没有 DEFAULT_ADMIN_ROLE 权限"
            ).to.false;
            expect(
                await factoryAbi.hasRole(await factoryAbi.PLATFORM_ADMIN_ROLE(), platform.address),
                "platform 拥有 PlatformAdmin 权限"
            ).to.true;

            await expect(
                factoryAbi.connect(treasury).setPlatformTreasury(buyer.address),
                "非 platform 无法转移 platformTreasury"
            ).to.reverted;
            await expect(factoryAbi.connect(treasury).setPlatformAdmin(buyer.address), "非 platform 无法转移 platformAdmin")
                .to.reverted;
            await expect(factoryAbi.connect(platform).setPlatformTreasury(buyer.address), "platform 可以转移 platformAdmin")
                .not.reverted;
            await expect(factoryAbi.connect(platform).setPlatformAdmin(buyer.address), "platform 可以转移 platformTreasury")
                .not.reverted;
            expect(
                await factoryAbi.hasRole(await factoryAbi.PLATFORM_ADMIN_ROLE(), buyer.address),
                "重置 platform 后 新的 platform 有了 PlatformAdmin 权限"
            ).to.true;
            expect(
                await factoryAbi.hasRole(await factoryAbi.PLATFORM_ADMIN_ROLE(), platform.address),
                "重置 platform 后 老的 platform 不再拥有 PlatformAdmin 权限"
            ).to.false;
        });
    });
});
