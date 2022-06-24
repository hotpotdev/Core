import { expect } from "chai";
import { ethers, network } from "hardhat";
import { defines } from "../../hardhat.config";
import { ExpMixedHotpotToken__factory } from "../../typechain";
import { HotpotTokenFactory__factory } from "../../typechain/factories/HotpotTokenFactory__factory";

const hre = require("hardhat");
const Ether = defines.Unit.Ether;
const Id = defines.Id;

describe("验证 Gas Fee 的收取", async () => {
    describe("Exp Mixed Hotpot Token", async () => {
        it("校验 mint 与 burn 方法 国库手续费", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];

            const token = await hre.expToken(500, 1000);
            const hotpotTokenAbi = await ExpMixedHotpotToken__factory.connect(token.address, buyer);
            // mint 1 eth
            await network.provider.send("hardhat_setBalance", [treasury.address, "0x0"]);
            let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: Ether });
            await mintTx1.wait();
            let balance2 = await treasury.getBalance();
            console.log(
                "mintRate (",
                hre.mintRate,
                "/ 10000 ) mint 消耗 eth 1",
                "treasury 获得 eth",
                ethers.utils.formatEther(balance2)
            );
            expect(Ether.mul(hre.mintRate).div(10000).eq(balance2), "国库 mint 手续费计算错误").to.true;
            // burn
            await network.provider.send("hardhat_setBalance", [treasury.address, "0x0"]);
            let erc20Balance3 = await hotpotTokenAbi.balanceOf(buyer.address);
            let asset4 = await ethers.provider.getBalance(hotpotTokenAbi.address);
            let burnTx2 = await hotpotTokenAbi.connect(buyer).burn(buyer.address, erc20Balance3,0);
            await burnTx2.wait();
            let asset5 = await ethers.provider.getBalance(hotpotTokenAbi.address);
            let balance6 = await treasury.getBalance();
            console.log(
                "burnRate (",
                hre.burnRate,
                "/ 10000 ) 合约 burn 消耗 eth",
                ethers.utils.formatEther(asset4.sub(asset5)),
                " treasury 获得eth",
                ethers.utils.formatEther(balance6)
            );
            expect(asset4.sub(asset5).mul(hre.burnRate).div(10000).eq(balance6), "国库 burn 手续费计算错误").to.true;
        });

        it("校验 mint 与 burn 方法 平台手续费", async () => {
            let signers = await ethers.getSigners();
            let buyer = signers[Id.Buyer];
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];

            const token = await hre.expToken();
            const hotpotTokenAbi = await ExpMixedHotpotToken__factory.connect(token.address, buyer);
            // mint 1 eth
            await network.provider.send("hardhat_setBalance", [platform.address, "0x0"]);
            let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: Ether });
            await mintTx1.wait();
            let balance2 = await platform.getBalance();
            console.log(
                "mintRate (",
                hre.mintRate,
                "/ 10000 ) mint 消耗 eth 1",
                "platform 获得 eth",
                ethers.utils.formatEther(balance2)
            );
            expect(Ether.mul(100).div(10000).eq(balance2), "平台 mint 手续费计算错误").to.true;
            // burn
            await network.provider.send("hardhat_setBalance", [platform.address, "0x0"]);
            let erc20Balance3 = await hotpotTokenAbi.balanceOf(buyer.address);
            let asset4 = await ethers.provider.getBalance(hotpotTokenAbi.address);
            let burnTx2 = await hotpotTokenAbi.connect(buyer).burn(buyer.address, erc20Balance3,0);
            await burnTx2.wait();
            let asset5 = await ethers.provider.getBalance(hotpotTokenAbi.address);
            let balance6 = await platform.getBalance();
            console.log(
                "burnRate (",
                hre.burnRate,
                "/ 10000 ) 合约 burn 消耗eth",
                ethers.utils.formatEther(asset4.sub(asset5)),
                "platform 获得 eth",
                ethers.utils.formatEther(balance6)
            );
            expect(asset4.sub(asset5).mul(100).div(10000).eq(balance6), "平台 burn 手续费计算错误").to.true;

            const factoryAbi = await HotpotTokenFactory__factory.connect(hre.factory.address, platform);
            let mintRate = 10,
                burnRate = 20;
            let setTax1 = await factoryAbi.setPlatformTaxRate(mintRate, burnRate);
            await setTax1.wait();
            // mint 1 eth
            await network.provider.send("hardhat_setBalance", [platform.address, "0x0"]);
            let mintTx3 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: Ether });
            await mintTx3.wait();
            let balance7 = await platform.getBalance();
            console.log(
                "mintRate (",
                mintRate,
                "/ 10000 ) mint 消耗 eth 1",
                "platform 获得 eth",
                ethers.utils.formatEther(balance7)
            );
            expect(Ether.mul(mintRate).div(10000).eq(balance7), "平台 mint 手续费 set后 计算错误").to.true;
            // burn
            await network.provider.send("hardhat_setBalance", [platform.address, "0x0"]);
            let erc20Balance7 = await hotpotTokenAbi.balanceOf(buyer.address);
            let asset8 = await ethers.provider.getBalance(hotpotTokenAbi.address);
            let burnTx4 = await hotpotTokenAbi.connect(buyer).burn(buyer.address, erc20Balance7,0);
            await burnTx4.wait();
            let asset9 = await ethers.provider.getBalance(hotpotTokenAbi.address);
            let balance10 = await platform.getBalance();
            console.log(
                "burnRate (",
                burnRate,
                "/ 10000 ) 合约 burn 消耗eth",
                ethers.utils.formatEther(asset8.sub(asset9)),
                "platform 获得 eth",
                ethers.utils.formatEther(balance10)
            );
            expect(asset8.sub(asset9).mul(burnRate).div(10000).eq(balance10), "平台 burn 手续费 set后 计算错误").to.true;

            let setTax2 = await factoryAbi.setPlatformTaxRate(5, 5);
            await setTax2.wait();
        });
    });
});
