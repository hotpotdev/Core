import { expect } from "chai"
import { ethers, network } from "hardhat"
import Web3 from "web3"
const hre = require("hardhat");
const Wei = ethers.BigNumber.from('1')
const GWei = ethers.BigNumber.from('1000000000')
const Ether = ethers.BigNumber.from('1000000000000000000')

// 验证算子正确性，单次铸造并单次销毁
// mining(uint256 nativeTokens, uint256 erc20Supply)
// burning(uint256 erc20Tokens, uint256 erc20Supply)
describe("Factory Function Test", async () => {
    it("Factory upgrade test", async () => {
        const signers = await hre.ethers.getSigners();
        const tokenProxy = await hre.expToken(100, 100);
        const platform = await hre.factory.getPlatform();
        let expTokenContract="ExpMixedHotpotToken"
        let linearTokenContract="LinearMixedHotpotToken"
        const expToken = await hre.ethers.getContractFactory(expTokenContract);
        const exp = await expToken.deploy();

        expect(hre.factory.connect(hre.treasury).addImplement("Exp",exp.address), '非 platform 用户不可 addImplement').to.reverted

        expect(hre.factory.connect(hre.platform).addImplement("Exp",exp.address), 'platform 用户可 addImplement').to.ok
        // console.log()
        expect(tokenProxy.connect(signers[signers.length - 1])["initialize(string,string,address,uint256,uint256,address,bool,uint256,bytes)"]
            ("TET2", "TET2", hre.treasury.address, 2000, 2000, signers[signers.length - 1].address, false, Ether.mul('50000000'), []), "proxy can not init twice").to.reverted

        expect(hre.factory.connect(signers[signers.length - 1]).upgradeTokenImplement(tokenProxy.address, []), '非 platform/treasury 用户不可 upgradeTokenImplement').to.reverted

        expect(hre.factory.connect(hre.platform).upgradeTokenImplement(tokenProxy.address, ""), 'platform 用户可 upgradeTokenImplement').to.ok

        expect(hre.factory.connect(hre.treasury).upgradeTokenImplement(tokenProxy.address, ""), 'treasury 用户可 upgradeTokenImplement').to.ok

    });
})
