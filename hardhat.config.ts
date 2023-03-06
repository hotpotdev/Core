import * as dotenv from "dotenv";

import { extendEnvironment, HardhatUserConfig, task } from "hardhat/config";
import { constants, ethers } from "ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "solidity-docgen";
import { IHotpotFactory__factory } from "./typechain";

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
    // hre.platform = signers[0];
    // hre.treasury = signers[0];
    hre.initCount = 0;
    // const factory = await IHotpotFactory__factory.connect("0x729c10a9956f98d7068498f44bcb026ddc76e951", signers[0]);
    // hre.factory = factory;
    hre.expToken = async (
        mintRate = 100,
        burnRate = 100,
        is721 = false,
        isSbt = false,
        raisingToken = constants.AddressZero
    ) => await initFactory(hre, "Exp", mintRate, burnRate, is721, isSbt, raisingToken);
    hre.sqrtToken = async (
        mintRate = 100,
        burnRate = 100,
        is721 = false,
        isSbt = false,
        raisingToken = constants.AddressZero
    ) => await initFactory(hre, "Sqrt", mintRate, burnRate, is721, isSbt, raisingToken);
    hre.linearToken = async (
        mintRate = 100,
        burnRate = 100,
        is721 = false,
        isSbt = false,
        raisingToken = constants.AddressZero
    ) => await initFactory(hre, "Linear", mintRate, burnRate, is721, isSbt, raisingToken);
});

async function initFactory(hre: any, type, mintRate, burnRate, is721, isSbt, raisingToken) {
    let ERC20Contract = "HotpotERC20Mixed";
    let ERC721Contract = "HotpotERC721Mixed";
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
    const mainType = is721 ? defines.ERC721Type : defines.ERC20Type;
    if (!hre.factory) {
        let hotpotFactoryContract = "HotpotTokenFactory";
        let govLib = await hre.ethers.getContractFactory("GovernorLib");
        let govAddr = await govLib.deploy();
        const HotpotFactory = await hre.ethers.getContractFactory(hotpotFactoryContract, {
            libraries: {
                GovernorLib: govAddr.address,
            },
        });
        const hotpotToken = await hre.ethers.getContractFactory(ERC20Contract);
        const hotpot = await hotpotToken.deploy();
        const erc721token = await hre.ethers.getContractFactory(ERC721Contract);
        const erc721 = await erc721token.deploy();

        const routeContract = await hre.ethers.getContractFactory("HotpotRoute");
        const route = await routeContract.deploy();
        const factory = await upgrades.deployProxy(
            HotpotFactory,
            [hre.platform.address, hre.platform.address, route.address],
            {
                unsafeAllowLinkedLibraries: true,
            }
        );
        hre.factory = factory;
        const expToken = await hre.ethers.getContractFactory(expTokenContract);
        const exp = await expToken.deploy();
        const linearToken = await hre.ethers.getContractFactory(linearTokenContract);
        const linear = await linearToken.deploy();
        const sqrtToken = await hre.ethers.getContractFactory(sqrtTokenContract);
        const sqrt = await sqrtToken.deploy();
        await hre.factory.connect(hre.platform).updateHotpotImplement(defines.ERC20Type, hotpot.address);
        await hre.factory.connect(hre.platform).updateHotpotImplement(defines.ERC721Type, erc721.address);
        await hre.factory.connect(hre.platform).addBondingCurveImplement(exp.address);
        await hre.factory.connect(hre.platform).addBondingCurveImplement(linear.address);
        await hre.factory.connect(hre.platform).addBondingCurveImplement(sqrt.address);
        console.log("factory address:", factory.address);
    }

    hre.mintRate = mintRate;
    hre.burnRate = burnRate;
    const data1 = hre.ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [defines.Unit.Ether.mul(100), 0]);
    const data2 = hre.ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [defines.Unit.Ether.mul(14), defines.Unit.Ether.mul(2e6)]
    );
    const data3 = hre.ethers.utils.defaultAbiCoder.encode(["uint256"], [defines.Unit.Ether.div(1e9)]);
    switch (type) {
        case "Exp":
            await hre.factory.connect(hre.platform).deployToken(
                {
                    tokenType: mainType,
                    bondingCurveType: defines.ExpType,
                    name: "Test Exponential Token" + hre.initCount,
                    symbol: "TET" + hre.initCount,
                    metadata: "tet meta",
                    projectAdmin: hre.treasury.address,
                    projectTreasury: hre.treasury.address,
                    projectMintTax: mintRate,
                    projectBurnTax: burnRate,
                    isSbt: isSbt,
                    raisingTokenAddr: raisingToken,
                    data: data2,
                },
                0
            );
            break;
        case "Linear":
            await hre.factory.connect(hre.platform).deployToken(
                {
                    tokenType: mainType,
                    bondingCurveType: defines.LinearType,
                    name: "Test Linear Token" + hre.initCount,
                    symbol: "TLT" + hre.initCount,
                    metadata: "tlt meta",
                    projectAdmin: hre.treasury.address,
                    projectTreasury: hre.treasury.address,
                    projectMintTax: mintRate,
                    projectBurnTax: burnRate,
                    isSbt: isSbt,
                    raisingTokenAddr: raisingToken,
                    data: data1,
                },
                0
            );
            break;
        case "Sqrt":
            await hre.factory.connect(hre.platform).deployToken(
                {
                    tokenType: mainType,
                    bondingCurveType: defines.SqrtType,
                    name: "Test Squareroot Token" + hre.initCount,
                    symbol: "TST" + hre.initCount,
                    metadata: "tst meta",
                    projectAdmin: hre.treasury.address,
                    projectTreasury: hre.treasury.address,
                    projectMintTax: mintRate,
                    projectBurnTax: burnRate,
                    isSbt: isSbt,
                    raisingTokenAddr: raisingToken,
                    data: data3,
                },
                0
            );
            break;
    }
    const addr = await hre.factory.getToken(hre.initCount++);
    return await hre.ethers.getContractAt(is721 ? ERC721Contract : ERC20Contract, addr);
}

const config: HardhatUserConfig = {
    docgen: {
        outputDir: "docs",
        pages: "files",
    },
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
        local: {
            url: "http://192.168.3.83:8545",
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
    ExpType: "exponential",
    LinearType: "linear",
    SqrtType: "squareroot",
    ERC20Type: "ERC20",
    ERC721Type: "ERC721",
};
