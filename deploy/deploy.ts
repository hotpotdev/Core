import { Wallet, utils } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { defines } from "../hardhat.config";
import {
    HotpotERC20Mixed__factory,
    HotpotERC721Mixed__factory,
    HotpotTokenFactory__factory,
    IHotpotFactory__factory,
    ProxyAdmin,
    ProxyAdmin__factory,
} from "../typechain";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
    const wallet = new Wallet("c28ecce6c999de8b7de6da34449ca9fbb1cf46873710f9b47c7953fc34fb94c3");
    const deployer = new Deployer(hre, wallet);
    const deployContract = async (c: string) => {
        const artifact = await deployer.loadArtifact(c);
        const deploymentFee = await deployer.estimateDeployFee(artifact, []);
        console.log(`The ${c} deployment is estimated to cost ${deploymentFee} ETH`);
        const contract = await deployer.deploy(artifact, []);
        await contract.deployed();
        const addr = contract.address;
        console.log(c, addr);
        return addr;
    };

    // Initialize the wallet.

    let erc721 = "HotpotERC721Mixed";
    let erc20 = "HotpotERC20Mixed";
    let exp = "ExpMixedBondingSwap";
    let linear = "LinearMixedBondingSwap";
    let sqrt = "SqrtMixedBondingSwap";
    let factory = "HotpotTokenFactory";
    const artifact = await deployer.loadArtifact(factory);
    const deploymentFee = await deployer.estimateDeployFee(artifact, []);
    console.log(`The ${factory} deployment is estimated to cost ${deploymentFee} ETH`);
    const ff = await deployer.deploy(artifact, []);
    // const ff = HotpotTokenFactory__factory.connect("0x3654aAe1fD22e495e0c37E03146deA72511DC009", deployer.zkWallet);
    await ff.initialize(deployer.zkWallet.address, deployer.zkWallet.address, "0x28226Ce6287119AEe9d4ED2Ffd9377dE1BAf806F");
    await ff.addBondingCurveImplement(await deployContract(exp));
    await ff.addBondingCurveImplement(await deployContract(sqrt));
    await ff.addBondingCurveImplement(await deployContract(linear));
    //obtain the Constructor Arguments

    console.log(await (await ff.updateHotpotImplement(defines.ERC20Type, await deployContract(erc20))).wait());
    console.log("add ERC20 succeed");
    console.log(await (await ff.updateHotpotImplement(defines.ERC721Type, await deployContract(erc721))).wait());
    console.log("add ERC721 succeed");
}
