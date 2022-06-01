import { expect } from "chai"
import { ethers, network } from "hardhat"
import Web3 from "web3"
import { defines } from "../../hardhat.config";
import { HotpotTokenFactory__factory } from "../../typechain";

const hre = require("hardhat");
const Ether = defines.Unit.Ether
const Id = defines.Id

// 验证算子正确性，单次铸造并单次销毁
// mining(uint256 nativeTokens, uint256 erc20Supply)
// burning(uint256 erc20Tokens, uint256 erc20Supply)
describe("Factory Function Test", async () => {
    it("合约 升级 测试", async () => {
        await network.provider.send("hardhat_reset")
        const signers = await ethers.getSigners();
        let treasury = signers[Id.Treasury]
        let platform = signers[Id.Platform]
        let anyone = signers[Id.Default]

        const tokenProxy = await hre.expToken(100, 100);
        let expTokenContract="ExpMixedHotpotToken"
        let linearTokenContract="LinearMixedHotpotToken"
        const expToken = await hre.ethers.getContractFactory(expTokenContract);
        const factoryAbi = await HotpotTokenFactory__factory.connect(hre.factory.address,platform)
        const exp = await expToken.deploy();
        await exp.deployed()

        await expect(factoryAbi.connect(platform).initialize(platform.address), 'Facotry 不可 init 两次').to.reverted

        await expect(factoryAbi.connect(treasury).addImplement("Exp",exp.address), '非 platform 用户不可 addImplement').to.reverted

        await expect(factoryAbi.connect(platform).addImplement("Exp",exp.address), 'platform 用户可 addImplement').to.ok
        // console.log()
        await expect(tokenProxy.connect(anyone)["initialize(string,string,address,uint256,uint256,bool,uint256,bytes)"]
            ("TET2", "TET2", treasury.address, 2000, 2000, false, Ether.mul('50000000'), []), "Token 不可以 init 两次").to.reverted

        await expect(factoryAbi.connect(anyone).upgradeTokenImplement(tokenProxy.address, []), '非 platform/treasury 用户不可 upgradeTokenImplement').to.reverted

        await expect(factoryAbi.connect(treasury).upgradeTokenImplement(tokenProxy.address, ""), 'treasury 用户不可 upgradeTokenImplement').to.reverted

        await expect(factoryAbi.connect(platform).upgradeTokenImplement(tokenProxy.address, ""), 'platform 用户可 upgradeTokenImplement').to.ok

    });
})
