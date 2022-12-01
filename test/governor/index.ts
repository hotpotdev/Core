import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
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
} from "../../typechain";
const hre = require("hardhat");
const votingPeriod = 5760;
describe(" Governor 模块测试", () => {
    it("部署Governor", async () => {
        const Id = defines.Id;
        const Ether = defines.Unit.Ether;
        function etherMantissa(num, scale = Ether) {
            if (num < 0) return BigNumber.from(2).pow(256).add(num);
            return BigNumber.from(num).mul(scale);
        }

        let signers = await ethers.getSigners();
        const admin = hre.treasury;
        const erc20Factory = await ethers.getContractFactory("TestErc20");
        const erc20 = await erc20Factory.connect(admin).deploy();

        async function enfranchise(actor, amount) {
            await erc20.connect(admin).transfer(actor.address, amount);
            await erc20.connect(actor).delegate(actor.address);
        }
        const factoryAddr = hre.factory.address;
        let factory = HotpotTokenFactory__factory.connect(factoryAddr, admin);
        const token = await hre.linearToken();
        const tokenAbi = await HotpotERC20Mixed__factory.connect(token.address, admin);
        const stgContract = await ethers.getContractFactory("BalanceOfStrategy");
        const stg = await stgContract.deploy();
        const projectName = "testDao";
        let strategyAbi = BalanceOfStrategy__factory.connect(stg.address, admin);
        await factory.createGovernorForToken(token.address, {
            strategy: stg.address,
            strategyReference: erc20.address,
            votingDelay: 0,
            votingPeriod: votingPeriod,
            proposalThreshold: 10,
            quorumVotes: 10,
            timelockDelay: 0,
        });
        const govAddr = await tokenAbi.getProjectAdmin();
        const governor = Governor__factory.connect(govAddr, admin);
        const gnverorAdmin = await governor.admin();
        const timelock = Timelock__factory.connect(gnverorAdmin, admin);
        expect((await timelock.admin()) == govAddr, "The administrator of timelock should be the governor");
        let trivialProposal, targets, values, signatures, callDatas;
        let proposalBlock;
        targets = [admin.address];
        values = ["0"];
        signatures = ["getBalanceOf(address)"];
        callDatas = [hre.ethers.utils.defaultAbiCoder.encode(["address"], [admin.address])];
        await erc20.delegate(admin.address);
        await governor.propose(targets, values, signatures, callDatas, "do nothing");
        proposalBlock = +(await hre.ethers.provider.getBlockNumber());
        let proposalId = await governor.latestProposalIds(admin.address);
        trivialProposal = await governor.proposals(proposalId);

        //propose
        describe("simple initialization", () => {
            it("ID is set to a globally unique identifier", async () => {
                expect(trivialProposal.id).equal(proposalId);
            });

            it("Proposer is set to the sender", async () => {
                expect(trivialProposal.proposer).equal(admin.address);
            });

            it("Start block is set to the current block number plus vote delay", async () => {
                expect(trivialProposal.startBlock).equal(trivialProposal.strategy.votingDelay.add(proposalBlock));
            });

            it("End block is set to the current block number plus the sum of vote delay and vote period", async () => {
                expect(trivialProposal.endBlock).equal(
                    trivialProposal.strategy.votingDelay.add(trivialProposal.strategy.votingPeriod).add(proposalBlock)
                );
            });

            it("ForVotes and AgainstVotes are initialized to zero", async () => {
                expect(trivialProposal.forVotes).equal("0");
                expect(trivialProposal.againstVotes).equal("0");
            });

            it("Executed and Canceled flags are initialized to false", async () => {
                expect(trivialProposal.canceled).equal(false);
                expect(trivialProposal.executed).equal(false);
            });

            it("ETA is initialized to zero", async () => {
                expect(trivialProposal.eta).equal("0");
            });

            it("Targets, Values, Signatures, Calldatas are set according to parameters", async () => {
                let dynamicFields = await governor.getActions(trivialProposal.id);
                // console.log(dynamicFields.targets, targets);
                expect(dynamicFields.targets == targets);
                expect(dynamicFields.values == values);
                expect(dynamicFields.signatures == signatures);
                expect(dynamicFields.calldatas == callDatas);
            });

            describe("This function must revert if", () => {
                it("the length of the values, signatures or calldatas arrays are not the same length,", async () => {
                    await expect(
                        governor.propose(targets.concat(admin.address), values, signatures, callDatas, "do nothing"),
                        "revert Governor::propose: proposal function information arity mismatch"
                    ).reverted;

                    await expect(
                        governor.propose(targets, values.concat(values), signatures, callDatas, "do nothing"),
                        "revert Governor::propose: proposal function information arity mismatch"
                    ).reverted;

                    await expect(
                        governor.propose(targets, values, signatures.concat(signatures), callDatas, "do nothing"),
                        "revert Governor::propose: proposal function information arity mismatch"
                    ).reverted;

                    await expect(
                        governor.propose(targets, values, signatures, callDatas.concat(callDatas), "do nothing"),
                        "revert Governor::propose: proposal function information arity mismatch"
                    ).reverted;
                });

                it("or if that length is zero or greater than Max Operations.", async () => {
                    await expect(
                        governor.propose([], [], [], [], "do nothing"),
                        "revert Governor::propose: must provide actions"
                    ).reverted;
                });

                describe("Additionally, if there exists a pending or active proposal from the same proposer, we must revert.", () => {
                    it("reverts with pending", async () => {
                        await expect(
                            governor.propose(targets, values, signatures, callDatas, "do nothing"),
                            "revert Governor::propose: one live proposal per proposer, found an already pending proposal"
                        ).reverted;
                    });

                    it("reverts with active", async () => {
                        // await mineBlock();
                        // await mineBlock();

                        await expect(
                            governor.propose(targets, values, signatures, callDatas, "do nothing"),
                            "revert Governor::propose: one live proposal per proposer, found an already active proposal"
                        ).reverted;
                    });
                });
            });

            it("This function returns the id of the newly created proposal. # proposalId(n) = succ(proposalId(n-1))", async () => {
                await enfranchise(signers[0], Ether.mul(40000));
                await erc20.connect(signers[0]).delegate(signers[0].address);

                await expect(governor.connect(signers[0]).propose(targets, values, signatures, callDatas, "yoot")).to.emit(
                    governor,
                    "ProposalCreated"
                );
                const nextProposalId = await governor.latestProposalIds(signers[0].address);
                expect(+nextProposalId).equal(+trivialProposal.id.add(1));
            });
        });

        //castVote
        describe("Governor#castVote/2", () => {
            describe("We must revert if:", () => {
                it("Such proposal already has an entry in its voters set matching the sender", async () => {
                    // await mineBlock();
                    // await mineBlock();

                    let vote = await governor.connect(signers[4]).castVote(proposalId, 1);

                    let vote2 = await governor.connect(signers[3]).castVoteWithReason(proposalId, 1, "");

                    await expect(
                        governor.connect(signers[4]).castVote(proposalId, 1),
                        "revert Governor::castVoteInternal: voter already voted"
                    ).reverted;
                });
            });

            describe("Otherwise", () => {
                it("we add the sender to the proposal's voters set", async () => {
                    const vote1 = await governor.getReceipt(proposalId, signers[2].address);
                    await expect(vote1.hasVoted == false);
                    await governor.connect(signers[2]).castVote(proposalId, 1);
                    const vote2 = await governor.getReceipt(proposalId, signers[2].address);
                    await expect(vote1.hasVoted == true);
                });

                describe("and we take the balance returned by GetPriorVotes for the given sender and the proposal's start block, which may be zero,", () => {
                    let actor; // an account that will propose, receive tokens, delegate to self, and vote on own proposal

                    it("and we add that ForVotes", async () => {
                        actor = signers[5];
                        await enfranchise(actor, Ether.mul(40000));

                        await governor.connect(actor).propose(targets, values, signatures, callDatas, "do nothing");
                        proposalId = await governor.latestProposalIds(actor.address);

                        let beforeFors = (await governor.proposals(proposalId)).forVotes;
                        // await mineBlock();
                        await governor.connect(actor).castVote(proposalId, 1);

                        let afterFors = (await governor.proposals(proposalId)).forVotes;
                        expect(afterFors.eq(beforeFors.add(Ether.mul(40000))));
                    });

                    it("or AgainstVotes corresponding to the caller's support flag.", async () => {
                        actor = signers[3];
                        await enfranchise(actor, etherMantissa(400001));

                        await governor.connect(actor).propose(targets, values, signatures, callDatas, "do nothing");
                        proposalId = await governor.latestProposalIds(actor.address);

                        let beforeAgainsts = (await governor.proposals(proposalId)).againstVotes;
                        // await mineBlock();
                        await governor.connect(actor).castVote(proposalId, 0);

                        let afterAgainsts = (await governor.proposals(proposalId)).againstVotes;
                        expect(afterAgainsts.eq(beforeAgainsts.add(etherMantissa(400001))));
                    });
                });

                describe("castVoteBySig", () => {
                    const Domain = (gov) => ({
                        name: "Compound Governor Bravo",
                        chainId: 1, // await web3.eth.net.getId(); See: https://github.com/trufflesuite/ganache-core/issues/515
                        verifyingContract: gov.address,
                    });
                    const Types = {
                        Ballot: [
                            { name: "proposalId", type: "uint256" },
                            { name: "support", type: "uint8" },
                        ],
                    };

                    it("reverts if the signatory is invalid", async () => {
                        await expect(
                            governor.castVoteBySig(proposalId, 0, 0, "0xbad", "0xbad"),
                            "revert Governor::castVoteBySig: invalid signature"
                        ).reverted;
                    });

                    it("casts vote on behalf of the signatory", async () => {
                        const a1 = signers[4];
                        await enfranchise(a1, 400001);
                        await governor.connect(a1).propose(targets, values, signatures, callDatas, "do nothing");
                        proposalId = await governor.latestProposalIds(a1.address);
                        // console.log(Domain(governor));
                        const eip712 = await a1._signTypedData(Domain(governor), Types, { proposalId, support: 1 });
                        const { r, s, v } = ethers.utils.splitSignature(eip712);

                        let beforeFors = (await governor.proposals(proposalId)).forVotes;
                        // await mineBlock();
                        const tx = await (await governor.castVoteBySig(proposalId, 1, v, r, s)).wait();
                        expect(tx.gasUsed < BigNumber.from(80000));

                        let afterFors = (await governor.proposals(proposalId)).forVotes;
                        expect(afterFors.eq(beforeFors.add(etherMantissa(400001))));
                    });
                });

                // it("receipt uses two loads", async () => {
                //   let actor = signers[2];
                //   let actor2 = signers[3];
                //   await enfranchise(comp, actor, 400001);
                //   await enfranchise(comp, actor2, 400001);
                //   await governor.propose(targets, values, signatures, callDatas, "do nothing"], { from: actor });
                //   proposalId = await governor.latestProposalIds(actor(;

                //   await mineBlock();
                //   await mineBlock();
                //   await governor.castVote(proposalId, 1], { from: actor });
                //   await governor.castVote(proposalId, 0], { from: actor2 });

                //   let trxReceipt = await governor.getReceipt(proposalId, actor(;
                //   let trxReceipt2 = await governor.getReceipt(proposalId, actor2(;

                //   let govDelegateAddress = "000000000000000000000000" + govDelegate._address.toString().toLowerCase().substring(2);

                //   await saddle.trace(trxReceipt, {
                //     constants: {
                //       account: actor,
                //     },
                //     preFilter: ({ op }) => op === "SLOAD",
                //     postFilter: ({ source }) => !source || source.includes("receipts"),
                //     execLog: (log) => {
                //       let [output] = log.outputs;
                //       let votes = "000000000000000000000000000000000000000054b419003bdf81640000";
                //       let voted = "01";
                //       let support = "01";

                //       if (log.depth == 0) {
                //         expect(output).toEqual(`${govDelegateAddress}`);
                //       } else {
                //         expect(output).toEqual(`${votes}${support}${voted}`);
                //       }
                //     },
                //     exec: (logs) => {
                //       expect(logs[logs.length - 1]["depth"(.toEqual(1); // last log is depth 1 (two SLOADS)
                //     },
                //   });

                //   await saddle.trace(trxReceipt2, {
                //     constants: {
                //       account: actor2,
                //     },
                //     preFilter: ({ op }) => op === "SLOAD",
                //     postFilter: ({ source }) => !source || source.includes("receipts"),
                //     execLog: (log) => {
                //       let [output] = log.outputs;
                //       let votes = "0000000000000000000000000000000000000000a968320077bf02c80000";
                //       let voted = "01";
                //       let support = "00";

                //       if (log.depth == 0) {
                //         expect(output).toEqual(`${govDelegateAddress}`);
                //       } else {
                //         expect(output).toEqual(`${votes}${support}${voted}`);
                //       }
                //     },
                //     exec: (logs) => {
                //       expect(logs[logs.length - 1]["depth"(.toEqual(1); // last log is depth 1 (two SLOADS)
                //     },
                //   });
                // });
            });
        });

        //queue
        describe("Governor#queue/1", () => {
            describe("overlapping actions", () => {
                it("reverts on queueing overlapping actions in same proposal", async () => {
                    const a1 = signers[1];
                    // const txAdmin = await send(timelock, "harnessSetAdmin", [gov._address]);

                    await enfranchise(a1, 3e6);

                    const txVote1 = await governor.connect(a1).castVote(proposalId, 1);

                    for (let i = 0; i < votingPeriod + 1; i++) {
                        await hre.network.provider.send("evm_mine");
                    }
                    await governor.queue(proposalId);
                    await expect(
                        governor.queue(proposalId),
                        "revert GovernorBravo::queueOrRevertInternal: identical proposal action already queued at eta"
                    ).reverted;
                });

                it("reverts on queueing overlapping actions in different proposals, works if waiting", async () => {
                    const a1 = signers[3];
                    const a2 = signers[2];
                    await enfranchise(a1, 3e6);
                    await enfranchise(a2, 3e6);
                    // await mineBlock();
                    await governor.connect(a2).propose(targets, values, signatures, callDatas, "do nothing");

                    const proposalId2 = await governor.latestProposalIds(a2.address);
                    const txVote2 = await governor.connect(a2).castVote(proposalId2, 1);

                    for (let i = 0; i < votingPeriod + 1; i++) {
                        await hre.network.provider.send("evm_mine");
                    }
                    await governor.queue(proposalId2);
                    // const txQueue1 = await governor.queue(proposalId);
                    await expect(
                        governor.queue(proposalId2),
                        "revert GovernorBravo::queueOrRevertInternal: identical proposal action already queued at eta"
                    ).reverted;
                    // const txQueue2 = await governor.queue(proposalId2);
                });
                it("There does not exist a proposal with matching proposal id where the current block number is between the proposal's start block (exclusive) and end block (inclusive)", async () => {
                    const a1 = signers[3];
                    await expect(
                        governor.connect(a1).castVote(proposalId, 1),
                        "revert Governor::castVoteInternal: voting is closed"
                    ).reverted;
                });
            });
        });
    });
});
