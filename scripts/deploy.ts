const hre = require('hardhat')
const ethers = hre.ethers;

async function main() {

    // Compile our Contracts, just in case
    await hre.run('compile');

    // Get Signers
    const signers = await hre.ethers.getSigners();
    const tokenProxy = await hre.expToken(100, 100);
    const platform = await hre.factory.getPlatform();
    let expTokenContract="ExpMixedHotpotToken"
    let linearTokenContract="LinearMixedHotpotToken"
    const expToken = await hre.ethers.getContractFactory(expTokenContract);
    const exp = await expToken.deploy();
    
    console.log(`Exp Hotpot Token deployed to: ${expToken.address}`);
    

    //   const initialBalance = await token.balanceOf(tokenRecipient.address);
    //   console.log(`${initialBalance / 1e18} tokens transfered to ${tokenRecipient.address}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });