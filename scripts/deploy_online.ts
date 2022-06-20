import { ethers, network, upgrades } from "hardhat";
import { defines } from "../hardhat.config";
import { ExpMixedHotpotToken__factory, HotpotTokenFactory, HotpotTokenFactory__factory } from "../typechain";
const Web3 = require("web3");
const hre = require("hardhat")

const round = 10
const Ether = defines.Unit.Ether
const Wei = defines.Unit.Wei
const Id = defines.Id

const web3 = new Web3(network.provider);

const expTokenContract="ExpMixedHotpotToken"
const linearTokenContract="LinearMixedHotpotToken"
const hotpotFactoryContract = "HotpotTokenFactory"

async function main() {
    let signers = await ethers.getSigners()
    let admin = signers[0]
    let factoryAddr = await deployFactory(admin.address,admin.address)
    let factoryAbi = HotpotTokenFactory__factory.connect(factoryAddr,admin)
    await addTokenImplementToFactory(factoryAbi,"Exp",expTokenContract)
    await deployExpToken(factoryAbi,"Exp","Test Exp","Test Symbol",admin.address,admin.address,100,200,false,Ether.mul(25000000))
}

const deployFactory = async (admin:string,treasury:string) => {
    const HotpotFactory = await ethers.getContractFactory(hotpotFactoryContract)
    
    const factory = await upgrades.deployProxy(HotpotFactory,[admin,treasury])
    await factory.deployed()
    const factoryAddr = factory.address;
    const implAddr = await upgrades.erc1967.getImplementationAddress(factoryAddr)
    console.warn("Deploying Factory...")
    console.log("Factory Address:",factoryAddr)
    console.log("Implement Address:",implAddr)
    console.log()
    return factoryAddr
}

const addTokenImplementToFactory = async (factoryAbi,type,tokenContractType = expTokenContract) => {
    const tokenFactory = await ethers.getContractFactory(tokenContractType);
    const token = await tokenFactory.deploy();
    await token.deployed()
    let addImplTx = await factoryAbi.addImplement(type, token.address);
    await addImplTx.wait()
    console.warn("Add Token Implement...")
    console.log(tokenContractType,"|",type,"\nModel Address:",token.address)
    console.log()
}

const deployExpToken = async (factoryAbi:HotpotTokenFactory,type,name,symbol,admin:string,treasury:string,mintRate = 100,burnRate = 100,premint = false,mintCap = Ether.mul(25000000)) => {
    const data2 = web3.eth.abi.encodeParameters(["bool","uint256"], [premint,mintCap]);
    let dtTx2 = await factoryAbi.deployToken(type, name, symbol, admin, treasury, mintRate, burnRate, data2);
    let tx = await dtTx2.wait()
    const expAddr = tx.events[7].address
    console.error("Deploying Token...")
    console.log(tx.events[7].event,'!')
    console.log(type,expAddr)
    console.log()
}

const deployLinearToken = async (factoryAbi:HotpotTokenFactory,type,name,symbol,admin:string,treasury:string,mintRate = 100,burnRate = 100, premint = false,mintCap = Ether.mul(25000000), k = Wei, p = Wei.mul(0)) => {
    const data1 = web3.eth.abi.encodeParameters(["bool","uint256","uint256", "uint256"], [premint,mintCap,k, p]);
    let dtTx1 = await factoryAbi.deployToken(type, name, symbol, admin, treasury, mintRate, burnRate, data1);
    await dtTx1.wait()
    const linearAddr = await factoryAbi.getToken(0);
    console.log("Deploying Token...")
    console.log(type,linearAddr)
    console.log()
}


const verifyContract = async (contactAddr: string) => {
    await hre.run("verify:verify", {
        address: contactAddr,
    })
}

const testMintAndBurn = async (tokenAbi,buyer) => {
    let mintTx = await tokenAbi.mint(buyer.address,0,{value:Ether.div(10)})
    await mintTx.wait()
    let erc20Balance = await tokenAbi.balanceOf(buyer.address)
    console.log("mint",ethers.utils.formatEther(erc20Balance))
    let burnTx = await tokenAbi.burn(buyer.address,erc20Balance)
    await burnTx.wait()
    console.log("burn",ethers.utils.formatEther(erc20Balance))
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});