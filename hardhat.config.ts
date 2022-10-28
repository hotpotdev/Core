import * as dotenv from "dotenv";

import { extendEnvironment, HardhatUserConfig, task } from "hardhat/config";
import { ethers } from "ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import '@openzeppelin/hardhat-upgrades';

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
  
  let signers = await hre.ethers.getSigners()
  hre.platform = signers[defines.Id.Platform]
  hre.treasury = signers[defines.Id.Treasury]
  
  const DefaultMintCap = defines.Unit.Ether.mul(25000000)
  hre.expToken = async (mintRate=100, burnRate=100,premint=false, mintCap=DefaultMintCap) => 
    await initFactory(hre, "Exp", mintRate, burnRate,premint,mintCap);
  hre.linearToken = async (mintRate=100, burnRate=100,premint=false, mintCap=DefaultMintCap) => 
    await initFactory(hre, "Linear", mintRate, burnRate,premint,mintCap);
});

async function initFactory(hre: any, type, mintRate, burnRate, premint,mintCap) {
  const Web3 = require("web3");
  // hre.network.provider is an EIP1193-compatible provider.
  hre.web3 = new Web3(hre.network.provider);
  let expTokenContract="ExpMixedHotpotToken"
  let linearTokenContract="LinearMixedHotpotToken"
  const {  network,upgrades } = require("hardhat");

  await network.provider.send("hardhat_setBalance", [hre.treasury.address, defines.Unit.Ether.mul(100)._hex.replace(/0x0+/, '0x')])
  await network.provider.send("hardhat_setBalance", [hre.platform.address, defines.Unit.Ether.mul(100)._hex.replace(/0x0+/, '0x')])

  let hotpotFactoryContract = "HotpotTokenFactory"
  const HotpotFactory = await hre.ethers.getContractFactory(hotpotFactoryContract)
  const factory = await upgrades.deployProxy(HotpotFactory,[hre.platform.address,hre.platform.address])
  hre.factory = factory
  const expToken = await hre.ethers.getContractFactory(expTokenContract);
  const exp = await expToken.deploy();
  const linearToken = await hre.ethers.getContractFactory(linearTokenContract);
  const linear = await linearToken.deploy();

  await hre.factory.connect(hre.platform).addImplement("Exp", exp.address);
  await hre.factory.connect(hre.platform).addImplement("Linear", linear.address);

  hre.mintRate = mintRate
  hre.burnRate = burnRate;
  const data1 = hre.web3.eth.abi.encodeParameters(["bool","uint256","uint256", "uint256"], [premint,mintCap,hre.ethers.BigNumber.from('100'), hre.ethers.BigNumber.from('0')]);
    const data2 = hre.web3.eth.abi.encodeParameters(["bool", "uint256", "uint256", "uint256"], [premint,mintCap,14,2e6]);
  await hre.factory.connect(hre.platform).deployToken("Linear", "TLT", "TLT", hre.treasury.address, hre.treasury.address, mintRate, burnRate, data1);
  await hre.factory.connect(hre.platform).deployToken("Exp", "TET", "TET", hre.treasury.address, hre.treasury.address, mintRate, burnRate, data2);
  const linearAddr = await hre.factory.getToken(0);
  const expAddr = await hre.factory.getToken(1);
  
//   console.log("exp address:", expAddr)
//   console.log("linear address:", linearAddr)
  switch (type) {
    case "Exp":return await hre.ethers.getContractAt(expTokenContract,expAddr)
    case "Linear":return await hre.ethers.getContractAt(linearTokenContract, linearAddr)
  }
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: {
        accountsBalance: "200000000000000000000001"
      },
    },
    gpnode: {
      url: process.env.GPNODE_URL || "",
      accounts:
      process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY.split(',') : [],
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || ""
    },
    rinkby: {
      url: process.env.RINKBY_URL || "",
      accounts:
      process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY.split(',') : [],
    },
    goerli: {
      url: process.env.GOERLI_URL || "",
      accounts:
      process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY.split(',') : [],
    },
    tbsc: {
      url: process.env.TBSC_URL || "",
      accounts:
      process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY.split(',') : [],
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 76800000
  },
};

export default config;

export const defines = {
    Unit: {
        Wei : ethers.BigNumber.from('1'),
        GWei : ethers.BigNumber.from('1000000000'),
        Ether : ethers.BigNumber.from('1000000000000000000')
    },
    Id: {
        Buyer: 0,
        Treasury: 1,
        Platform: 2,
        Buyer1: 4,
        Buyer2: 5,
        Buyer3: 6,
        Default: 7,
    }
}
