// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Ballot {
    address public owner;

    struct Election {
        string name;
        string[] candidates;
        bool isActive;
        mapping(address => bool) hasVoted;
        mapping(uint256 => uint256) votes;
    }

    Election[] public elections;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createElection(string memory _name, string[] memory _candidates) public onlyOwner {
        Election storage newElection = elections.push();
        newElection.name = _name;
        newElection.candidates = _candidates;
        newElection.isActive = true;
    }

    function deactivateElection(uint256 _electionId) public onlyOwner {
        require(_electionId < elections.length, "Invalid election ID");
        elections[_electionId].isActive = false;
    }

    function addCandidate(uint256 _electionId, string memory _candidate) public onlyOwner {
        require(_electionId < elections.length, "Invalid election ID");
        elections[_electionId].candidates.push(_candidate);
    }

    function removeCandidate(uint256 _electionId, uint256 _candidateIndex) public onlyOwner {
        require(_electionId < elections.length, "Invalid election ID");
        Election storage election = elections[_electionId];
        require(_candidateIndex < election.candidates.length, "Invalid candidate index");

        for (uint256 i = _candidateIndex; i < election.candidates.length - 1; i++) {
            election.candidates[i] = election.candidates[i + 1];
        }
        election.candidates.pop();
    }

    function vote(uint256 _electionId, uint256 _choice) public {
        require(_electionId < elections.length, "Invalid election ID");
        Election storage election = elections[_electionId];

        require(election.isActive, "Election is not active");
        require(!election.hasVoted[msg.sender], "You have already voted");
        require(_choice < election.candidates.length, "Invalid choice");

        election.hasVoted[msg.sender] = true;
        election.votes[_choice]++;
    }

    function getResults(uint256 _electionId) public view returns (uint256[] memory) {
        require(_electionId < elections.length, "Invalid election ID");
        Election storage election = elections[_electionId];

        uint256[] memory results = new uint256[](election.candidates.length);
        for (uint256 i = 0; i < election.candidates.length; i++) {
            results[i] = election.votes[i];
        }
        return results;
    }

    function getcandidates(uint256 _electionId) public view returns (string[] memory) {
        require(_electionId < elections.length, "Invalid election ID");
        return elections[_electionId].candidates;
    }

    function getAllElections() public view returns (
        string[] memory names,
        bool[] memory activeStatuses,
        string[][] memory candidates
    ) {
        uint256 electionsCount = elections.length;
        names = new string[](electionsCount);
        activeStatuses = new bool[](electionsCount);
        candidates = new string[][](electionsCount);

        for (uint256 i = 0; i < electionsCount; i++) {
            names[i] = elections[i].name;
            activeStatuses[i] = elections[i].isActive;
            candidates[i] = elections[i].candidates;
        }
    }
}
