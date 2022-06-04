import { ethers, network, upgrades } from "hardhat";
import { defines } from "../hardhat.config";
import { ExpMixedHotpotToken__factory, HotpotTokenFactory__factory } from "../typechain";
const Web3 = require("web3");

const round = 10
const Ether = defines.Unit.Ether
const Id = defines.Id

async function main() {

    const hre = require('hardhat')
    // Compile our Contracts, just in case
    await hre.run('compile');
    
    let signers = await ethers.getSigners()
    let admin = signers[0]
    let web3 = new Web3(network.provider);

    let expTokenContract="ExpMixedHotpotToken"
    let linearTokenContract="LinearMixedHotpotToken"
    let hotpotFactoryContract = "HotpotTokenFactory"

    console.log("wallet balance",ethers.utils.formatEther(await admin.getBalance()))
    const DefaultMintCap = defines.Unit.Ether.mul(25000000)
    const HotpotFactory = await ethers.getContractFactory(hotpotFactoryContract)
    
    const factory = await upgrades.deployProxy(HotpotFactory,[admin.address,admin.address])
    await factory.deployed()
    const factoryAddr = factory.address;
    const implAddr = await upgrades.erc1967.getImplementationAddress(factoryAddr)
    console.log("Factory",factoryAddr)
    console.log("Implement",implAddr)
    // await hre.run("verify:verify", {
    //     address: factoryAddr,
    // })
    // await hre.run("verify:verify", {
    //     address: implAddr,
    //     constructorArguments: [admin.address,admin.address]
    // })
    // const expToken = await ethers.getContractFactory(expTokenContract);
    // const exp = await expToken.deploy();
    // await exp.deployed()
    // console.log("exp model deployed")
    // // const linearToken = await ethers.getContractFactory(linearTokenContract);
    // // const linear = await linearToken.deploy();
    // // await linear.deployed()
    // // console.log("linear model deployed")

    // let addImplTx1 = await factory.addImplement("Exp", exp.address);
    // await addImplTx1.wait()
    // console.log('add exp impl')
    // // let addImplTx2 = await factory.addImplement("Linear", linear.address);
    // // await addImplTx2.wait()
    // // console.log('add linear impl')

    // let mintRate = 100
    // let burnRate = 100;
    // const data1 = web3.eth.abi.encodeParameters(["bool","uint256","uint256", "uint256"], [false,DefaultMintCap,ethers.BigNumber.from('100'), ethers.BigNumber.from('0')]);
    // const data2 = web3.eth.abi.encodeParameters(["bool","uint256"], [false,DefaultMintCap]);
    // // let dtTx1 = await factory.deployToken("Linear", "TLT", "TLT", admin.address, admin.address, mintRate, burnRate, data1);
    // // await dtTx1.wait()
    // let dtTx2 = await factory.deployToken("Exp", "TET", "TET", admin.address, admin.address, mintRate, burnRate, data2);
    // await dtTx2.wait()
    // // const linearAddr = await factory.getToken(0);
    // // const expAddr = await factory.getToken(1);
    // const expAddr = await factory.getToken(0);
    // // console.log("first linear token",linearAddr)
    // console.log("first exp token",expAddr)
    // let tokenAbi = ExpMixedHotpotToken__factory.connect(expAddr,admin)
    // let mintTx = await tokenAbi.mint(admin.address,0,{value:Ether.div(10)})
    // await mintTx.wait()
    // let erc20Balance = await tokenAbi.balanceOf(admin.address)
    // console.log("mint",ethers.utils.formatEther(erc20Balance))
    // let burnTx = await tokenAbi.burn(admin.address,erc20Balance)
    // await burnTx.wait()
    // console.log("burn",ethers.utils.formatEther(erc20Balance))
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });