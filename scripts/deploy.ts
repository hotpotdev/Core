import { ethers, network } from "hardhat";
import { defines } from "../hardhat.config";
import { ExpMixedHotpotToken__factory, HotpotTokenFactory__factory } from "../typechain";

const hre = require('hardhat')
const round = 10
const Ether = defines.Unit.Ether
const Id = defines.Id

async function main() {

    // Compile our Contracts, just in case
    await hre.run('compile');
    let factoryAddress
    let tokenAddress
    // Defines
    let expTokenContract="ExpMixedHotpotToken"
    let linearTokenContract="LinearMixedHotpotToken"
    // Get Signers
    const signers = await ethers.getSigners();
    const buyer = signers[Id.Buyer]
    const treasury = signers[Id.Treasury]
    const platform = signers[Id.Platform]
    // Reset Network Balance
    await network.provider.send("hardhat_setBalance", [treasury.address, Ether.mul(1000000)._hex.replace(/0x0+/, '0x')])
    await network.provider.send("hardhat_setBalance", [platform.address, Ether.mul(1000000)._hex.replace(/0x0+/, '0x')])
    await network.provider.send("hardhat_setBalance", [buyer.address, Ether.mul(1000000)._hex.replace(/0x0+/, '0x')])
    // Deploy
    const tokenProxy = await hre.expToken();
    factoryAddress = factoryAddress || hre.factory.address
    console.log(`Hotpot Token Factory deployed to: ${factoryAddress}`)
    console.log(`Exp Hotpot Token deployed to: ${tokenProxy.address}`)
    // Get Abis
    const hotpotFactoryAbi = HotpotTokenFactory__factory.connect(factoryAddress,buyer)
    const hotpotTokenAbi = ExpMixedHotpotToken__factory.connect(tokenProxy.address,buyer)
    // Tasks
    for (let i = 0; i < round; i++) {
        let mintTx1 = await hotpotTokenAbi.connect(buyer).mint(buyer.address, 0, { value: Ether.mul(500) })
        await mintTx1.wait()
        let totalErc20Balance = await hotpotTokenAbi.balanceOf(buyer.address)
        let burnTx2 = await hotpotTokenAbi.connect(buyer).burn(buyer.address, totalErc20Balance.div(2))
        await burnTx2.wait()

        let platformBalance = await platform.getBalance()
        let treasuryBalance = await treasury.getBalance()
        let contractAsset = await ethers.provider.getBalance(hotpotTokenAbi.address)
        let buyerBalance = await buyer.getBalance()
        let erc20Balance = await hotpotTokenAbi.balanceOf(buyer.address)
        let estimateBurn = await hotpotTokenAbi.estimateBurn(erc20Balance)
        let price = await hotpotTokenAbi.price()
        console.log(
            '平台eth余额', ethers.utils.formatEther(platformBalance),
            '国库eth余额', ethers.utils.formatEther(treasuryBalance),
            '合约eth资产', ethers.utils.formatEther(contractAsset),
            '价格eth/erc20', ethers.utils.formatEther(price), '\n',
            'BUYER eth 余额', ethers.utils.formatEther(buyerBalance),
            'BUYER erc20 余额', ethers.utils.formatEther(erc20Balance),
            'BUYER eth 可兑取', ethers.utils.formatEther(estimateBurn.dy),
            '误差损失 eth wei', contractAsset.sub(estimateBurn.dy).toString(), '\n',
        )
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });