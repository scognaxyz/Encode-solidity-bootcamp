
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { ethers } from "hardhat";
import { MyToken, MyToken__factory, TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";


// Decision

const nameDecision = "Next forward buying on Sorare"
const proposalsOf1 = [ "Lauriente", "Lookman", "Kvaratskhelia"]
const nameDecison2 = "Next memecoin investment"
const proposalsOf2 = [ "Tsuka", "JDB", "POM"]


describe(" Tokenized Ballot ", async() => {
  let  tokenizedBallotContract: TokenizedBallot;
  let  myTokenContract: MyToken;
  let  deployer: SignerWithAddress;
  let  account1: SignerWithAddress;
  let  account2: SignerWithAddress;
  let  account3: SignerWithAddress;

  // Deploying, minting , delegating and assigning role in myToken before testing TokenizedBallot
  // Deployng TokenizedBallot
  beforeEach(async () => {
    //deploying
    [deployer, account1, account2, account3] = await ethers.getSigners();
    const myTokenContractFactory =  new MyToken__factory(deployer);
    myTokenContract = await myTokenContractFactory.deploy();
    await myTokenContract.deployed();
    //minting
    const mintValue = ethers.utils.parseEther("1");
    const mint1 = await myTokenContract.mint(account1.address, mintValue);
    mint1.wait();
    const mint2 = await myTokenContract.mint(account2.address, mintValue);
    mint2.wait();
    const mint3 = await myTokenContract.mint(account3.address, mintValue);
    mint3.wait();

    // self delegation
    const delegation1 = await myTokenContract.connect(account1).delegate(account1.address);
    delegation1.wait();
    const delegation2 = await myTokenContract.connect(account2).delegate(account2.address);
    delegation2.wait();
    const delegation3 = await myTokenContract.connect(account3).delegate(account3.address);
    delegation3.wait();

    // give role to mint and create decision
    const giveRole = await myTokenContract.grantRole(myTokenContract.MINTER_ROLE(), account1.address);
    giveRole.wait();

    // deploying TokenizedBallot
    const tokenizeBallotContractFactory = new TokenizedBallot__factory(deployer);
    tokenizedBallotContract = await tokenizeBallotContractFactory.deploy(myTokenContract.address);
    await tokenizedBallotContract.deployed();
  });

  describe(" Setting a decision", async () => {

    beforeEach(async() => {
      const setDecision = await tokenizedBallotContract.setDecision(ethers.utils.formatBytes32String(`${nameDecision}`),(await ethers.provider.getBlockNumber()) -1, proposalsOf1.map(prop => ethers.utils.formatBytes32String(prop)));
      setDecision.wait();
      const cicii= await tokenizedBallotContract.getProposals(ethers.utils.formatBytes32String(`${nameDecision}`));
      const cicci2 = cicii.map(prop=>ethers.utils.parseBytes32String(prop.name));
      console.log(`${cicci2}`)
      let i
    })
    it ("Proposals should match with proposals given as parameters", async () =>{

    });
  
  });
  
});