import { ethers } from "hardhat";
import { MyToken__factory } from "../typechain-types";


const mintValue = ethers.utils.parseEther("10");

async function main() {
  const [deployer,account1,account2] = await ethers.getSigners();

  // deploy contract
  const contractFactory = new MyToken__factory(deployer);
  const contract = await contractFactory.deploy();
  const deployTransactionReceipt = await contract.deployTransaction.wait();

  console.log(`The tokenized smart contract was deployed at block ${deployTransactionReceipt.blockNumber} by ${account1.address}`)

  // mint some tokens
  const mintTx = await contract.mint(account1.address, mintValue);
  const mintTxReceipt = await mintTx.wait();
  console.log(`Tokens minted at transaction ${mintTxReceipt.transactionHash} for ${account1.address} `)
  
  //check balance
  const balanceAccount1 = await contract.balanceOf(account1.address);
  console.log(`Account 1 ${account1.address} has ${balanceAccount1} tokens`) 

  // delegate votePower
  const delegation = await contract.connect(account1).delegate(account1.address);
  const delegationTxReceipt = await delegation.wait();
  console.log(`Account 1 has delegated to himself in transaction with ${delegationTxReceipt.transactionHash} hash `) 

  // check vote power
  const votePower = await contract.getVotes(account1.address);
  console.log(`Account 1 has ${votePower} vote power`)

  // check role
  const roleMINTER = await contract.hasRole(contract.MINTER_ROLE(),deployer.address)
  console.log(`Has deployer ${deployer.address} role to mint? \n ${roleMINTER} `)

  // give some role
  const giveRole = await contract.grantRole(ethers.utils.formatBytes32String("ADMIN"),account1.address)
  const giveRoleTxReceipt = await giveRole.wait()
  const roleAdmin = await contract.hasRole(ethers.utils.formatBytes32String("ADMIN"),account1.address)
  console.log(`Admin role given by deployer to account 1 at block ${giveRoleTxReceipt.transactionHash} ? ${roleAdmin}`)

  // transfer tokens
  const transfer = await contract.connect(account1).transfer(account2.address, mintValue)
  await transfer.wait()
  
  const balanceAccount2 =  await contract.balanceOf(account2.address)
  const votePowerAccount1 = await contract.getVotes(account1.address)
  console.log(`Account 1 has ${votePowerAccount1} vote power`)
  console.log(`Account 2 has ${balanceAccount2} tokens`)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
