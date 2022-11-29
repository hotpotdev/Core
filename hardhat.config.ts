import * as dotenv from "dotenv";

import { extendEnvironment, HardhatUserConfig, task } from "hardhat/config";
import { ethers } from "ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";

dotenv.config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
extendEnvironment(async (hre: any) => {
    let signers = await hre.ethers.getSigners();
    hre.platform = signers[defines.Id.Platform];
    hre.treasury = signers[defines.Id.Treasury];
    const DefaultMintCap = defines.Unit.Ether.mul(25000000);
    hre.expToken = async (mintRate = 100, burnRate = 100, isSbt = false, mintCap = DefaultMintCap) =>
        await initFactory(hre, "Exp", mintRate, burnRate, isSbt, mintCap);
    hre.sqrtToken = async (mintRate = 100, burnRate = 100, isSbt = false, mintCap = DefaultMintCap) =>
        await initFactory(hre, "Sqrt", mintRate, burnRate, isSbt, mintCap);
    hre.linearToken = async (mintRate = 100, burnRate = 100, isSbt = false, mintCap = DefaultMintCap) =>
        await initFactory(hre, "Linear", mintRate, burnRate, isSbt, mintCap);
});

async function initFactory(hre: any, type, mintRate, burnRate, isSbt, mintCap) {
    let hotpotTokenContract = "HotpotERC20Mixed";
    let expTokenContract = "ExpMixedBondingSwap";
    let linearTokenContract = "LinearMixedBondingSwap";
    let sqrtTokenContract = "SqrtMixedBondingSwap";
    const { network, upgrades } = require("hardhat");

    await network.provider.send("hardhat_setBalance", [
        hre.treasury.address,
        defines.Unit.Ether.mul(100)._hex.replace(/0x0+/, "0x"),
    ]);
    await network.provider.send("hardhat_setBalance", [
        hre.platform.address,
        defines.Unit.Ether.mul(100)._hex.replace(/0x0+/, "0x"),
    ]);

    let hotpotFactoryContract = "HotpotTokenFactory";
    const hotpotToken = await hre.ethers.getContractFactory(hotpotTokenContract);
    const hotpot = await hotpotToken.deploy();
    const HotpotFactory = await hre.ethers.getContractFactory(hotpotFactoryContract);
    const factory = await upgrades.deployProxy(HotpotFactory, [hre.platform.address, hre.platform.address, hotpot.address]);
    hre.factory = factory;
    const expToken = await hre.ethers.getContractFactory(expTokenContract);
    const exp = await expToken.deploy();
    const linearToken = await hre.ethers.getContractFactory(linearTokenContract);
    const linear = await linearToken.deploy();
    const sqrtToken = await hre.ethers.getContractFactory(sqrtTokenContract);
    const sqrt = await sqrtToken.deploy();
    const expType = "exponential";
    const linearType = "linear";
    const sqrtType = "squareroot";
    await hre.factory.connect(hre.platform).addBondingCurveImplement(exp.address);
    await hre.factory.connect(hre.platform).addBondingCurveImplement(linear.address);
    await hre.factory.connect(hre.platform).addBondingCurveImplement(sqrt.address);
    hre.mintRate = mintRate;
    hre.burnRate = burnRate;
    const data1 = hre.ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [hre.ethers.BigNumber.from("100"), hre.ethers.BigNumber.from("0")]
    );
    const data2 = hre.ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [14, 2e6]);
    const data3 = hre.ethers.utils.defaultAbiCoder.encode(["uint256"], [1]);
    await hre.factory.connect(hre.platform).deployToken({
        tokenType: linearType,
        name: "Test Linear Token",
        symbol: "TLT",
        metadata: "tlt meta",
        projectAdmin: hre.treasury.address,
        projectTreasury: hre.treasury.address,
        projectMintTax: mintRate,
        projectBurnTax: burnRate,
        mintCap: mintCap,
        isSbt: isSbt,
        data: data1,
    });
    await hre.factory.connect(hre.platform).deployToken({
        tokenType: expType,
        name: "Test Exponential Token",
        symbol: "TET",
        metadata: "tet meta",
        projectAdmin: hre.treasury.address,
        projectTreasury: hre.treasury.address,
        projectMintTax: mintRate,
        projectBurnTax: burnRate,
        mintCap: mintCap,
        isSbt: isSbt,
        data: data2,
    });
    await hre.factory.connect(hre.platform).deployToken({
        tokenType: sqrtType,
        name: "Test Squareroot Token",
        symbol: "TST",
        metadata: "tst meta",
        projectAdmin: hre.treasury.address,
        projectTreasury: hre.treasury.address,
        projectMintTax: mintRate,
        projectBurnTax: burnRate,
        mintCap: mintCap,
        isSbt: isSbt,
        data: data3,
    });
    const linearAddr = await hre.factory.getToken(0);
    const expAddr = await hre.factory.getToken(1);
    const sqrtAddr = await hre.factory.getToken(2);

    //   console.log("exp address:", expAddr)
    //   console.log("linear address:", linearAddr)
    switch (type) {
        case "Exp":
            return await hre.ethers.getContractAt(hotpotTokenContract, expAddr);
        case "Linear":
            return await hre.ethers.getContractAt(hotpotTokenContract, linearAddr);
        case "Sqrt":
            return await hre.ethers.getContractAt(hotpotTokenContract, sqrtAddr);
    }
}

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.17",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            viaIR: true,
        },
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            accounts: {
                accountsBalance: "200000000000000000000001",
            },
            allowUnlimitedContractSize: true,
        },
        gpnode: {
            url: process.env.GPNODE_URL || "",
            accounts: process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY.split(",") : [],
        },
        ropsten: {
            url: process.env.ROPSTEN_URL || "",
        },
        rinkby: {
            url: process.env.RINKBY_URL || "",
            accounts: process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY.split(",") : [],
        },
        goerli: {
            url: process.env.GOERLI_URL || "",
            accounts: process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY.split(",") : [],
        },
        tbsc: {
            url: process.env.TBSC_URL || "",
            accounts: process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY.split(",") : [],
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD",
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    mocha: {
        timeout: 76800000,
    },
};

export default config;

export const defines = {
    Unit: {
        Wei: ethers.BigNumber.from("1"),
        GWei: ethers.BigNumber.from("1000000000"),
        Ether: ethers.BigNumber.from("1000000000000000000"),
    },
    Id: {
        Buyer: 0,
        Treasury: 1,
        Platform: 2,
        Buyer1: 4,
        Buyer2: 5,
        Buyer3: 6,
        Default: 7,
    },
};
