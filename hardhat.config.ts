import * as dotenv from "dotenv";

import { extendEnvironment, HardhatUserConfig, task } from "hardhat/config";
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
  let treasury = signers[1]
  let platform = signers[2]
  hre.platform = platform;
  hre.treasury = treasury;
  
  // const hotpotTokenAbi = ExpMixedHotpotToken__factory.connect(expAddr, signers[0])
  hre.expToken = async (mintRate, burnRate) => await initFactory(hre, "Exp", mintRate, burnRate);
  hre.linearToken = async (mintRate, burnRate) => await initFactory(hre, "Linear", mintRate, burnRate);
});

async function initFactory(hre: any, type, mintRate, burnRate) {
  const Web3 = require("web3");
  const Ether = hre.ethers.BigNumber.from('1000000000000000000')
  // hre.network.provider is an EIP1193-compatible provider.
  hre.web3 = new Web3(hre.network.provider);
  let expTokenContract="ExpMixedHotpotToken"
  let linearTokenContract="LinearMixedHotpotToken"

  let hotpotFactoryContract = "HotpotTokenFactory"
  const { ethers, upgrades } = require("hardhat");
  const HotpotFactory = await hre.ethers.getContractFactory(hotpotFactoryContract)
  const factory=await upgrades.deployProxy(HotpotFactory,[hre.platform.address])
  hre.factory = factory
  const expToken = await hre.ethers.getContractFactory(expTokenContract);
  const exp = await expToken.deploy();
  const linearToken = await hre.ethers.getContractFactory(linearTokenContract);
  const linear = await linearToken.deploy();
  const data = hre.web3.eth.abi.encodeParameters(["uint256", "uint256"], [hre.ethers.BigNumber.from('10'), hre.ethers.BigNumber.from('0')]);

  await hre.factory.connect(hre.platform).addImplement("Exp", exp.address);
  await hre.factory.connect(hre.platform).addImplement("Linear", linear.address);

  hre.mintRate = mintRate
  hre.burnRate = burnRate;
  await hre.factory.connect(hre.platform).deployToken("Exp", "TET", "TET", hre.treasury.address, mintRate, burnRate, false, Ether.mul('50000000'), []);
  await hre.factory.connect(hre.platform).deployToken("Linear", "TLT", "TLT", hre.treasury.address, mintRate, burnRate, false, Ether.mul('50000000'), data);
  const expAddr = await hre.factory.getTokens(0);
  const linearAddr = await hre.factory.getTokens(1);
  // console.log("exp address:", expAddr)
  // console.log("linear address:", linearAddr)
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
        runs: 200,
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
      accounts: [],
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || ""
    },
    goerli: {
      url: process.env.GOERLI_URL || "",
      accounts:
      process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
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
