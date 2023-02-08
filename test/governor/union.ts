import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, ContractTransaction } from "ethers";
import { ethers, network, upgrades } from "hardhat";
import { cwd } from "process";
import Web3 from "Web3";
import { HttpProvider } from "web3/providers";
import { defines } from "../../hardhat.config";
import {
    HotpotTokenFactory__factory,
    Governor__factory,
    BalanceOfStrategy__factory,
    HotpotERC20Mixed__factory,
    Timelock__factory,
    Proxy,
    Proxy__factory,
    Governor,
    Timelock,
    HotpotERC20Mixed,
    HotpotTokenFactory,
} from "../../typechain";
const Id = defines.Id;
const Ether = defines.Unit.Ether;
const hre = require("hardhat");
const votingPeriod = 5;
describe(" Governor Hotpot 联合测试", () => {
    it("部署 HotpotToken & Governor", async () => {
        const deploy = async () => {
            let signers = await ethers.getSigners();
            let treasury = signers[Id.Treasury];
            let platform = signers[Id.Platform];
            let buyer2 = signers[Id.Buyer2];
            let buyer3 = signers[Id.Buyer3];
            let setBalance = async (signer: SignerWithAddress, number: BigNumber) => {
                await network.provider.send("hardhat_setBalance", [
                    signer.address,
                    Ether.mul(number)._hex.replace(/0x0+/, "0x"),
                ]);
            };
            let factoryAbi: HotpotTokenFactory;
            let tokenAbi: HotpotERC20Mixed;
            let timelockAbi: Timelock;
            let governorAbi: Governor;
            const token = await hre.linearToken();
            const factoryAddr = hre.factory.address;
            factoryAbi = HotpotTokenFactory__factory.connect(factoryAddr, treasury);
            tokenAbi = await HotpotERC20Mixed__factory.connect(token.address, treasury);
            let mintAndDelegate = async (signer: SignerWithAddress, number: BigNumber) => {
                let need = await tokenAbi.estimateMintNeed(number);
                await setBalance(signer, need.paidAmount.mul(2));
                let tx = await tokenAbi
                    .connect(signer)
                    .mint(await signer.getAddress(), need.paidAmount, 0, { value: need.paidAmount });
                await tx.wait();
                tx = await tokenAbi.connect(signer).delegate(await signer.getAddress());
                await tx.wait();
            };
            await mintAndDelegate(buyer2, Ether.mul(30));
            await mintAndDelegate(buyer3, Ether.mul(30));
            const stgContract = await ethers.getContractFactory("BalanceOfStrategy");
            const stg = await stgContract.deploy();
            await factoryAbi.createGovernorForToken(token.address, {
                strategy: stg.address,
                strategyReference: token.address,
                votingDelay: 0,
                votingPeriod: votingPeriod,
                proposalThreshold: 10,
                quorumVotes: 20,
                timelockDelay: 0,
            });
            const timelockAddr = await tokenAbi.getProjectAdmin();
            timelockAbi = Timelock__factory.connect(timelockAddr, treasury);
            const timelockAdmin = await timelockAbi.admin();
            governorAbi = Governor__factory.connect(timelockAdmin, treasury);
            return {
                treasury,
                platform,
                buyer2,
                buyer3,
                factoryAbi,
                tokenAbi,
                timelockAbi,
                governorAbi,
            };
        };
        describe("Governor Proposal Control Hotpot Method", () => {
            it("Governor Set Metadata", async () => {
                let { treasury, platform, buyer2, buyer3, factoryAbi, tokenAbi, timelockAbi, governorAbi } = await deploy();
                let tx: ContractTransaction;
                let testMetadata = "test1sdfghgd3";
                tx = await governorAbi
                    .connect(buyer2)
                    .propose(
                        [tokenAbi.address],
                        [0],
                        ["setMetadata(string)"],
                        [ethers.utils.defaultAbiCoder.encode(["string"], [testMetadata])],
                        "test set metadata"
                    );
                await tx.wait();
                let proposalId = await governorAbi.latestProposalIds(buyer2.address);
                tx = await governorAbi.connect(buyer2).castVote(proposalId, 1);
                await tx.wait();
                for (let i = 0; i < votingPeriod + 1; i++) {
                    await hre.network.provider.send("evm_mine");
                }
                tx = await governorAbi.queue(proposalId);
                await tx.wait();
                tx = await governorAbi.execute(proposalId);
                await tx.wait();
                expect(testMetadata == (await tokenAbi.getMetadata()), "Metadata Reset Failed").to.true;
            });
            it("Governor Transfer Admin", async () => {
                let { treasury, platform, buyer2, buyer3, factoryAbi, tokenAbi, timelockAbi, governorAbi } = await deploy();
                let tx: ContractTransaction;
                tx = await governorAbi
                    .connect(buyer2)
                    .propose(
                        [tokenAbi.address],
                        [0],
                        ["setProjectAdmin(address)"],
                        [ethers.utils.defaultAbiCoder.encode(["address"], [buyer2.address])],
                        "test transfer admin"
                    );
                await tx.wait();
                let proposalId = await governorAbi.latestProposalIds(buyer2.address);
                tx = await governorAbi.connect(buyer2).castVote(proposalId, 1);
                await tx.wait();
                for (let i = 0; i < votingPeriod + 1; i++) {
                    await hre.network.provider.send("evm_mine");
                }
                tx = await governorAbi.queue(proposalId);
                await tx.wait();
                tx = await governorAbi.execute(proposalId);
                await tx.wait();
                expect(buyer2.address == (await tokenAbi.getProjectAdmin()), "Project Admin Reset Failed").to.true;
            });
            it("Governor Transfer Project Treasury", async () => {
                let { treasury, platform, buyer2, buyer3, factoryAbi, tokenAbi, timelockAbi, governorAbi } = await deploy();
                let tx: ContractTransaction;
                tx = await governorAbi
                    .connect(buyer2)
                    .propose(
                        [tokenAbi.address],
                        [0],
                        ["setProjectTreasury(address)"],
                        [ethers.utils.defaultAbiCoder.encode(["address"], [buyer2.address])],
                        "test transfer project treasury"
                    );
                await tx.wait();
                let proposalId = await governorAbi.latestProposalIds(buyer2.address);
                tx = await governorAbi.connect(buyer2).castVote(proposalId, 1);
                await tx.wait();
                for (let i = 0; i < votingPeriod + 1; i++) {
                    await hre.network.provider.send("evm_mine");
                }
                tx = await governorAbi.queue(proposalId);
                await tx.wait();
                tx = await governorAbi.execute(proposalId);
                await tx.wait();
                expect(buyer2.address == (await tokenAbi.getProjectTreasury()), "Project Treasury Reset Failed").to.true;
            });
            // @TODO
            it("Governor Update Contract Implement", async () => {
                let { treasury, platform, buyer2, buyer3, factoryAbi, tokenAbi, timelockAbi, governorAbi } = await deploy();
                let tx: ContractTransaction;
                let upgradeTokenImplement = "HotpotERC20Mixed";
                const upgraded = await ethers.getContractFactory(upgradeTokenImplement);
                const up = await upgraded.deploy();
                await up.deployed();
                network.provider.send("evm_mine");
                await factoryAbi.connect(platform).updateHotpotImplement(defines.ERC20Type, up.address);
                let beforeImpAddr = await upgrades.erc1967.getImplementationAddress(tokenAbi.address);
                // console.log('升级前 Implement Address', beforeImpAddr)
                tx = await factoryAbi.connect(platform).requestUpgrade(tokenAbi.address, []);
                await tx.wait();

                tx = await governorAbi
                    .connect(buyer2)
                    .propose(
                        [factoryAbi.address],
                        [0],
                        ["rejectUpgrade(address,string)"],
                        [ethers.utils.defaultAbiCoder.encode(["address", "string"], [tokenAbi.address, "test"])],
                        "test reject upgrade"
                    );
                await tx.wait();
                let proposalId = await governorAbi.latestProposalIds(buyer2.address);
                tx = await governorAbi.connect(buyer2).castVote(proposalId, 1);
                await tx.wait();
                for (let i = 0; i < votingPeriod + 1; i++) {
                    await hre.network.provider.send("evm_mine");
                }
                tx = await governorAbi.connect(buyer2).queue(proposalId);
                await tx.wait();
                tx = await governorAbi.connect(buyer2).execute(proposalId);
                await tx.wait();

                await network.provider.send("evm_increaseTime", [2 * 60 * 60 * 24]);
                await network.provider.send("evm_mine");
                await expect(factoryAbi.connect(platform).upgradeTokenImplement(tokenAbi.address), "拒绝后升级操作不能执行")
                    .to.reverted;

                // let afterImpAddr = await upgrades.erc1967.getImplementationAddress(tokenAbi.address)
                // console.log('升级后 Implement Address', afterImpAddr)
                // expect(beforeImpAddr != afterImpAddr, '升级后 Implement Address 不相同').to.true
            });
        });
    });
});
