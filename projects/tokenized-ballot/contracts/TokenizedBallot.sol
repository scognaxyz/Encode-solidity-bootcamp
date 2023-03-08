// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface IMyToken {
  function getPastVotes(address account, uint256 blockNumber) external view returns (uint256);
  function hasRole(bytes32 role, address account) external view returns (bool);
}

contract TokenizedBallot {
  struct Proposal {
    bytes32 name;
    uint256 voteCount;
    uint256 votesAddresses;
  }

  struct Decision {
    bytes32 name;
    uint256 targetBlockNumber;
    Proposal[] proposals;
    mapping(address => uint256) votingPowerSpent;
  }
  Proposal[] public _proposals;
  mapping (bytes32  => Decision ) public decisions;
  IMyToken public tokenContract;


  modifier onlyAdmin() {
    require (tokenContract.hasRole(keccak256("MINTER_ROLE"),msg.sender));
    _;
  }

  constructor(address _tokenContract) {
    tokenContract = IMyToken(_tokenContract);
  }

  function setDecision (bytes32 _name, uint256 _targetBlockNumber, bytes32[] memory proposalNames) public onlyAdmin {
    Proposal[] storage proposals = _proposals;
    for (uint256 i = 0; i < proposalNames.length; i++) {
      proposals.push(Proposal({ name: proposalNames[i], voteCount: 0, votesAddresses: 0 }));
    }
    Decision storage newDecision = decisions[_name];
    newDecision.name = _name;
    newDecision.targetBlockNumber = _targetBlockNumber;
    newDecision.proposals = proposals;
  }

  function getProposals(bytes32 _name) public view returns (Proposal[] memory) {
    return decisions[_name].proposals;
  }

  function vote(bytes32 _name, uint256 indexProposal, uint256 amount) external {
    
    require(votingPower(decisions[_name].name, msg.sender) >= amount);
    decisions[_name].votingPowerSpent[msg.sender] += amount;
    decisions[_name].proposals[indexProposal].voteCount += amount;
  }

  function votingPower(bytes32 name, address account) public view returns (uint256) {
    return tokenContract.getPastVotes(account, decisions[name].targetBlockNumber) - decisions[name].votingPowerSpent[account];
  }

  function winningProposal(bytes32 _name) public view returns (uint256 winningProposal_) {
    uint256 winningVoteCount = 0;
    uint256 winningVotesAddresses = 0;
    for (uint256 p = 0; p < decisions[_name].proposals.length; p++) {
      if (decisions[_name].proposals[p].voteCount > winningVoteCount) {
        winningVoteCount = decisions[_name].proposals[p].voteCount;
        winningVotesAddresses = decisions[_name].proposals[p].votesAddresses;
        winningProposal_ = p;
      } else if (decisions[_name].proposals[p].voteCount == winningVoteCount 
      && decisions[_name].proposals[p].votesAddresses > winningVotesAddresses) {

      }
    }
  }

  function winnerName(bytes32 _name) external view returns (bytes32 winnerName_) {
    winnerName_ = decisions[_name].proposals[winningProposal(_name)].name;
  }
}