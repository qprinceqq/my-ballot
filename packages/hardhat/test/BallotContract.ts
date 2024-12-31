import { ethers } from "hardhat";
import { expect } from "chai";

describe("Ballot Contract", function () {
  let ballot: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Ballot = await ethers.getContractFactory("Ballot");
    ballot = await Ballot.deploy(); // Deploy contract

    // Ensure the contract was deployed by checking its address
    expect(ballot.address).to.not.equal("0x0000000000000000000000000000000000000000");
  });

  it("should deploy the contract", async function () {
    expect(await ballot.owner()).to.equal(owner.address);
  });

  it("should allow the owner to create an election", async function () {
    const candidates = ["Alice", "Bob"];
    await ballot.createElection("Election 1", candidates);

    const election = await ballot.elections(0);
    expect(election.name).to.equal("Election 1");

    // Get candidates using getcandidates function
    const electionCandidates = await ballot.getcandidates(0);
    expect(electionCandidates).to.deep.equal(candidates); // Check if the candidates match
  });

  it("should not allow non-owners to create an election", async function () {
    const candidates = ["Alice", "Bob"];
    await expect(ballot.connect(addr1).createElection("Election 2", candidates))
      .to.be.revertedWith("Only the owner can perform this action");
  });

  it("should allow the owner to deactivate an election", async function () {
    const candidates = ["Alice", "Bob"];
    await ballot.createElection("Election 3", candidates);

    await ballot.deactivateElection(0);
    const election = await ballot.elections(0);
    expect(election.isActive).to.equal(false);
  });

  it("should not allow non-owners to deactivate an election", async function () {
    const candidates = ["Alice", "Bob"];
    await ballot.createElection("Election 4", candidates);

    await expect(ballot.connect(addr1).deactivateElection(0))
      .to.be.revertedWith("Only the owner can perform this action");
  });

  it("should allow a user to vote", async function () {
    const candidates = ["Alice", "Bob"];
    await ballot.createElection("Election 5", candidates);

    await ballot.connect(addr1).vote(0, 0);
    const results = await ballot.getResults(0);
    expect(results[0]).to.equal(1); // Alice should have 1 vote
    expect(results[1]).to.equal(0); // Bob should have 0 votes
  });

  it("should not allow a user to vote twice", async function () {
    const candidates = ["Alice", "Bob"];
    await ballot.createElection("Election 6", candidates);

    await ballot.connect(addr1).vote(0, 0);
    await expect(ballot.connect(addr1).vote(0, 1))
      .to.be.revertedWith("You have already voted");
  });

  it("should not allow voting in an inactive election", async function () {
    const candidates = ["Alice", "Bob"];
    await ballot.createElection("Election 7", candidates);
    await ballot.deactivateElection(0);

    await expect(ballot.connect(addr1).vote(0, 0))
      .to.be.revertedWith("Election is not active");
  });

  it("should allow the owner to add a candidate", async function () {
    const candidates = ["Alice", "Bob"];
    await ballot.createElection("Election 8", candidates);

    await ballot.addCandidate(0, "Charlie");
    const updatedCandidates = await ballot.getcandidates(0);
    expect(updatedCandidates).to.include("Charlie");
  });

  it("should not allow non-owners to add a candidate", async function () {
    const candidates = ["Alice", "Bob"];
    await ballot.createElection("Election 9", candidates);

    await expect(ballot.connect(addr1).addCandidate(0, "Charlie"))
      .to.be.revertedWith("Only the owner can perform this action");
  });

  it("should allow the owner to remove a candidate", async function () {
    const candidates = ["Alice", "Bob", "Charlie"];
    await ballot.createElection("Election 10", candidates);

    await ballot.removeCandidate(0, 1); // Remove Bob
    const updatedCandidates = await ballot.getcandidates(0);
    expect(updatedCandidates).to.not.include("Bob");
  });

  it("should not allow non-owners to remove a candidate", async function () {
    const candidates = ["Alice", "Bob", "Charlie"];
    await ballot.createElection("Election 11", candidates);

    await expect(ballot.connect(addr1).removeCandidate(0, 1))
      .to.be.revertedWith("Only the owner can perform this action");
  });
});
