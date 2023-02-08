import { expect } from "chai";
import { ethers, network } from "hardhat";
import { defines } from "../../hardhat.config";
import { ExpMixedBondingSwap__factory, HotpotERC20Mixed__factory, HotpotTokenFactory__factory } from "../../typechain";
import { solidity } from "ethereum-waffle";
import { constants } from "ethers";

const hre = require("hardhat");
const Ether = defines.Unit.Ether;
const Id = defines.Id;
// 验证算子正确性，单次铸造并单次销毁
// calculateMintAmountFromBondingCurve(uint256 nativeTokens, uint256 erc20Supply)
// burning(uint256 erc20Tokens, uint256 erc20Supply)
describe("Factory 功能 Test", async () => {
    it("工厂的 Token 升级 测试", async () => {
        const signers = await ethers.getSigners();
        let treasury = signers[Id.Treasury];
        let platform = signers[Id.Platform];
        let anyone = signers[Id.Default];
        let calculatorContract = "ExpMixedBondingSwap";
        const BondingCurve = await ethers.getContractFactory(calculatorContract);
        const curve = await BondingCurve.deploy();
        await curve.deployed();
        const tokenProxy = await hre.expToken();
        let expTokenContract = "HotpotERC20Mixed";
        const expToken = await hre.ethers.getContractFactory(expTokenContract);
        const factoryAbi = await HotpotTokenFactory__factory.connect(hre.factory.address, platform);
        const exp = await expToken.deploy();
        await exp.deployed();

        await expect(
            factoryAbi.connect(platform).initialize(platform.address, platform.address, exp.address),
            "Facotry 不可 init 两次"
        ).reverted;

        await expect(
            factoryAbi.connect(treasury).addBondingCurveImplement(curve.address),
            "非 platform 用户不可 addImplement"
        ).reverted;

        await expect(factoryAbi.connect(platform).addBondingCurveImplement(curve.address), "不可重复添加implement").reverted;
        const data2 = hre.ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [14, 2e6]);
        await expect(
            tokenProxy
                .connect(anyone)
                ["initialize(address,string,string,string,address,address,uint256,uint256,bool,address,bytes,address)"](
                    curve.address,
                    "TET2",
                    "TET2",
                    "metadata",
                    treasury.address,
                    treasury.address,
                    2000,
                    2000,
                    false,
                    constants.AddressZero,
                    data2,
                    hre.factory.address
                ),
            "Token 不可以 init 两次"
        ).reverted;

        let upgradeTokenImplement = "HotpotERC20Mixed";
        const upgraded = await ethers.getContractFactory(upgradeTokenImplement);
        const up = await upgraded.deploy();
        await up.deployed();
        await expect(
            factoryAbi.connect(anyone).updateHotpotImplement(defines.ERC20Type, up.address),
            "非 platform/treasury 用户不可 updateHotpotImplement"
        ).reverted;
        await expect(
            factoryAbi.connect(platform).updateHotpotImplement(defines.ERC20Type, up.address),
            "platform/treasury 用户可 updateHotpotImplement"
        ).not.reverted;
        //requestUpgrade
        await expect(
            factoryAbi.connect(anyone).requestUpgrade(tokenProxy.address, data2),
            "非 platform/treasury 用户不可 requestUpgrade"
        ).reverted;
        await expect(
            factoryAbi.connect(treasury).requestUpgrade(tokenProxy.address, data2),
            "treasury 用户不可 requestUpgrade"
        ).reverted;
        await expect(factoryAbi.connect(platform).requestUpgrade(tokenProxy.address, data2), "platform 用户可 requestUpgrade")
            .not.reverted;
        //rejectUpgrade
        await expect(
            factoryAbi.connect(anyone).rejectUpgrade(tokenProxy.address, "no"),
            "非 platform/treasury 用户不可 rejectUpgrade"
        ).reverted;
        await expect(
            factoryAbi.connect(treasury).rejectUpgrade(tokenProxy.address, "no"),
            "projectAdmin 用户可 rejectUpgrade"
        ).not.reverted;
        await expect(factoryAbi.connect(platform).rejectUpgrade(tokenProxy.address, "no"), "platform 用户不可 rejectUpgrade")
            .reverted;
        //upgradeTokenImplement
        await expect(factoryAbi.connect(platform).requestUpgrade(tokenProxy.address, data2), "platform 用户可 requestUpgrade")
            .not.reverted;
        await network.provider.send("evm_increaseTime", [2 * 60 * 60 * 24]);
        await network.provider.send("evm_mine");
        await expect(
            factoryAbi.connect(anyone).upgradeTokenImplement(tokenProxy.address),
            "非 platform/treasury 用户不可 upgradeTokenImplement"
        ).reverted;
        await expect(
            factoryAbi.connect(treasury).upgradeTokenImplement(tokenProxy.address),
            "treasury 用户不可 upgradeTokenImplement"
        ).reverted;
        await expect(
            factoryAbi.connect(platform).upgradeTokenImplement(tokenProxy.address),
            "platform 用户可 upgradeTokenImplement"
        ).not.reverted;
    });
});
