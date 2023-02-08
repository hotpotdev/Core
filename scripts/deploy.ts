import { ethers, network, upgrades } from "hardhat";
import { defines } from "../hardhat.config";
import { HotpotERC20Mixed__factory, HotpotERC721Mixed__factory, HotpotTokenFactory__factory } from "../typechain";
import "@openzeppelin/hardhat-upgrades";
import { parseEther } from "ethers/lib/utils";
const hre = require("hardhat");
const round = 10;
const Ether = defines.Unit.Ether;
const Id = defines.Id;

async function deployContract(c: string) {
    const addr = (await (await ethers.getContractFactory(c)).deploy()).address;
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
    // let govLib = await ethers.getContractFactory("GovernorLib");
    // let govAddr = await govLib.deploy();
    // const HotpotFactory = await ethers.getContractFactory(factory, {
    //     libraries: {
    //         GovernorLib: govAddr.address,
    //         // "0xe88279Ae50eC62843CA09DC55e668E2e5D8aFe21"
    //     },
    // });
    const ff = HotpotTokenFactory__factory.connect(
        // (
        //     await upgrades.deployProxy(HotpotFactory, [deployer.address, deployer.address], {
        //         unsafeAllowLinkedLibraries: true,
        //     })
        // ).address,
        "0xA2047cB6198aCA5A27901fd57E0a5C1222778715",
        deployer
    );
    // ff.updateHotpotImplement
    // return;
    // const tt = HotpotERC20Mixed__factory.connect("0x709adced7b80b4195251407b137e60bef45ba570", deployer);
    // console.log(tt.address, deployer.address, parseEther("0.05"));
    // const tx = await tt.mint(deployer.address, 0, { value: parseEther("0.05") });
    // console.log(tx.hash, tx.nonce);
    // return;
    // await ff.addBondingCurveImplement("0x05777573b8bbAe97E74D99e50eEC93AFBbfB9A36");
    // console.log("add linear succeed");
    // await ff.addBondingCurveImplement(await deployContract(sqrt));
    // console.log("add sqrt succeed");
    // await ff.addBondingCurveImplement(await deployContract(exp));
    // console.log("add exp succeed");
    await ff.updateHotpotImplement(defines.ERC20Type, "0x85C849B7f7c99ABE76d24d0f22db82e334FD267F");
    console.log("add ERC20 succeed");
    await ff.updateHotpotImplement(defines.ERC721Type, await deployContract(erc721));
    console.log("add ERC721 succeed");
    console.log("BalanceOfRatioStrategy", await deployContract("BalanceOfRatioStrategy"));
    console.log("BalanceOfStrategy", await deployContract("BalanceOfStrategy"));
    console.log("GnosisStrategy", await deployContract("GnosisStrategy"));
    console.log("Factory", ff.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
