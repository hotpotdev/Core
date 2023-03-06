import { ethers, network, upgrades } from "hardhat";
import { defines } from "../hardhat.config";
import {
    HotpotERC20Mixed__factory,
    HotpotERC721Mixed__factory,
    HotpotTokenFactory__factory,
    IHotpotFactory__factory,
    ProxyAdmin,
    ProxyAdmin__factory,
} from "../typechain";
import "@openzeppelin/hardhat-upgrades";
import { AbiCoder, defaultAbiCoder, parseEther } from "ethers/lib/utils";
const hre = require("hardhat");
const round = 10;
const Ether = defines.Unit.Ether;
const Id = defines.Id;

async function deployContract(c: string) {
    const contract = await (await ethers.getContractFactory(c)).deploy();
    await contract.deployed();
    const addr = contract.address;
    console.log(c, addr);
    return addr;
}

async function main() {
    // Compile our Contracts, just in case
    await hre.run("compile");
    // Defines
    let erc721 = "HotpotERC721Mixed";
    let erc20 = "HotpotERC20Mixed";
    let exp = "ExpMixedBondingSwap";
    let linear = "LinearMixedBondingSwap";
    let sqrt = "SqrtMixedBondingSwap";
    let factory = "HotpotTokenFactory";
    let signers = await ethers.getSigners();
    let deployer = signers[0];
    let govLib = await ethers.getContractFactory("GovernorLib");
    let govAddr = await govLib.deploy();
    await govAddr.deployed();
    const HotpotFactory = await ethers.getContractFactory(factory, {
        libraries: {
            GovernorLib: govAddr.address,
        },
    });
    const ff = HotpotTokenFactory__factory.connect(
        await (
            await (
                await upgrades.deployProxy(
                    HotpotFactory,
                    [deployer.address, deployer.address, await deployContract("HotpotRoute")],
                    {
                        unsafeAllowLinkedLibraries: true,
                    }
                )
            ).deployed()
        ).address,
        deployer
    );
    (await ff.addBondingCurveImplement(await deployContract(linear))).wait();
    console.log("add linear succeed");
    await (await ff.addBondingCurveImplement(await deployContract(sqrt))).wait();
    console.log("add sqrt succeed");
    await (await ff.addBondingCurveImplement(await deployContract(exp))).wait();
    console.log("add exp succeed");
    await (await ff.updateHotpotImplement(defines.ERC20Type, await deployContract(erc20))).wait();
    console.log("add ERC20 succeed");
    await (await ff.updateHotpotImplement(defines.ERC721Type, await deployContract(erc721))).wait();
    console.log("add ERC721 succeed");
    // console.log("BalanceOfRatioStrategy", await deployContract("BalanceOfRatioStrategy"));
    // console.log("BalanceOfStrategy", await deployContract("BalanceOfStrategy"));
    // console.log("GnosisStrategy", await deployContract("GnosisStrategy"));
    console.log("Factory", ff.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
