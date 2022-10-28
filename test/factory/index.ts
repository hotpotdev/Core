import { expect } from "chai";
import { ethers, network } from "hardhat";
import Web3 from "web3";
import { defines } from "../../hardhat.config";
import { ExpMixedHotpotToken__factory, HotpotTokenFactory__factory } from "../../typechain";
import { solidity } from "ethereum-waffle";

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

        const tokenProxy = await hre.expToken();
        let expTokenContract = "ExpMixedHotpotToken";
        let linearTokenContract = "LinearMixedHotpotToken";
        const expToken = await hre.ethers.getContractFactory(expTokenContract);
        const factoryAbi = await HotpotTokenFactory__factory.connect(hre.factory.address, platform);
        const exp = await expToken.deploy();
        await exp.deployed();

        await expect(factoryAbi.connect(platform).initialize(platform.address, platform.address), "Facotry 不可 init 两次")
            .reverted;

        await expect(factoryAbi.connect(treasury).addImplement("Exp", exp.address), "非 platform 用户不可 addImplement")
            .reverted;

        await expect(factoryAbi.connect(platform).addImplement("Exp", exp.address), "platform 用户可 addImplement").not
            .reverted;
        // console.log()
        const data2 = hre.web3.eth.abi.encodeParameters(["bool", "uint256", "uint256", "uint256"], [true, Ether,14,2e6]);
        await expect(
            tokenProxy
                .connect(anyone)
                ["initialize(string,string,address,address,uint256,uint256,bytes)"](
                    "TET2",
                    "TET2",
                    treasury.address,
                    treasury.address,
                    2000,
                    2000,
                    data2
                ),
            "Token 不可以 init 两次"
        ).reverted;

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

    it("工厂的 Model Initialize 抢跑 测试", async () => {
        const signers = await ethers.getSigners();
        let treasury = signers[Id.Treasury];
        let admin = signers[Id.Platform];
        let anyone = signers[Id.Default];

        const {  network,upgrades } = require("hardhat");
        let hotpotFactoryContract = "HotpotTokenFactory"
        let expTokenContract="ExpMixedHotpotToken"
        let linearTokenContract="LinearMixedHotpotToken"

        const HotpotFactory = await ethers.getContractFactory(hotpotFactoryContract)
        const factory = await upgrades.deployProxy(HotpotFactory,[admin.address,treasury.address])
        const factoryAbi = HotpotTokenFactory__factory.connect(factory.address,admin)
        const expModelToken = await ethers.getContractFactory(expTokenContract);
        const expModel = await expModelToken.deploy();
        const expModelAbi = ExpMixedHotpotToken__factory.connect(expModel.address,anyone)
        
        let web3 = new Web3(network.provider)
        const data2 = web3.eth.abi.encodeParameters(["bool","uint256","uint256","uint256"], [true,Ether.mul(100000),14,2e6]);
        
        await expect(expModelAbi["initialize(string,string,address,address,uint256,uint256,bytes)"](
            "Name2",
            "Symbol2",
            treasury.address,
            treasury.address,
            2000,
            2000,
            data2
        ),'model ').reverted
        expect(await factoryAbi.getPlatformAdmin()==admin.address,"Initailize 错误").to.true
        expect(await factoryAbi.getPlatformTreasury()==treasury.address,"Initailize 错误").to.true
      
        await factoryAbi.connect(admin).addImplement("Exp", expModel.address);

        await factoryAbi.connect(admin).deployToken("Exp", "Name1", "Symbol1", admin.address, anyone.address, 100, 100, data2);
        
        const expAddr = await factoryAbi.getToken(await (await factoryAbi.getTokensLength()).sub(1));
        const expTokenAbi = ExpMixedHotpotToken__factory.connect(expAddr,anyone)
        expect(await expTokenAbi.name()=="Name1","Initailize 错误, 赋值错误").to.true
        expect(await expTokenAbi.symbol()=="Symbol1","Initailize 错误, 赋值错误").to.true
        expect(await expTokenAbi.getProjectAdmin()==admin.address,"Initailize 错误, 赋值错误").to.true
        expect(await expTokenAbi.getProjectTreasury()==anyone.address,"Initailize 错误, 赋值错误").to.true
        expect(expTokenAbi.address!=expModelAbi.address,"模板地址不应等于代币地址, 不应复制Model数据").to.true
        expect(await expModelAbi.name()!="Name1","Initailize 错误, 不应复制Model数据").to.true
        expect(await expModelAbi.symbol()!="Symbol1","Initailize 错误, 不应复制Model数据").to.true
        expect(await expModelAbi.getProjectAdmin()!=admin.address,"Initailize 错误, 不应复制Model数据").to.true
        expect(await expModelAbi.getProjectTreasury()!=anyone.address,"Initailize 错误, 不应复制Model数据").to.true
        
    });
});
