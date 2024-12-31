// SPDX-License-Identifier: MIT
"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import deployedContracts from "../contracts/deployedContracts";

export default function Home() {
  const [results, setResults] = useState<number[]>([]);
  const [electionName, setElectionName] = useState("");
  const [candidates, setCandidates] = useState("");
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
  const [choice, setChoice] = useState<number>(0);

  const contractAddress = deployedContracts[31337].Ballot.address;
  const contractABI = deployedContracts[31337].Ballot.abi;

  const getContract = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return null;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  };

  const fetchElections = async () => {
    const contract = await getContract();
    if (!contract) return;

    try {
      const [names, activeStatuses, candidatesList] = await contract.getAllElections();
      setElections(
        names.map((name: string, index: number) => ({
          id: index,
          name,
          isActive: activeStatuses[index],
          candidates: candidatesList[index],
        }))
      );
    } catch (error) {
      console.error("Error fetching elections:", error);
    }
  };

  const handleCreateElection = async () => {
    const contract = await getContract();
    if (!contract) return;

    try {
      const tx = await contract.createElection(electionName, candidates.split(","));
      await tx.wait();
      alert("Election created successfully!");
      fetchElections();
    } catch (error) {
      console.error("Error creating election:", error);
    }
  };

  const handleDeactivateElection = async (electionId: number) => {
    const contract = await getContract();
    if (!contract) return;

    try {
      const tx = await contract.deactivateElection(electionId);
      await tx.wait();
      alert("Election deactivated successfully!");
      fetchElections();
    } catch (error) {
      console.error("Error deactivating election:", error);
    }
  };

  const handleAddCandidate = async (electionId: number, candidate: string) => {
    const contract = await getContract();
    if (!contract) return;

    try {
      const tx = await contract.addCandidate(electionId, candidate);
      await tx.wait();
      alert("Candidate added successfully!");
      fetchElections();
    } catch (error) {
      console.error("Error adding candidate:", error);
    }
  };

  const handleRemoveCandidate = async (electionId: number, candidateIndex: number) => {
    const contract = await getContract();
    if (!contract) return;

    try {
      const tx = await contract.removeCandidate(electionId, candidateIndex);
      await tx.wait();
      alert("Candidate removed successfully!");
      fetchElections();
    } catch (error) {
      console.error("Error removing candidate:", error);
    }
  };

  const handleVote = async () => {
    if (selectedElectionId === null) {
      alert("Please select an election to vote on!");
      return;
    }

    const contract = await getContract();
    if (!contract) return;

    try {
      const tx = await contract.vote(selectedElectionId, choice);
      await tx.wait();
      alert("Vote submitted successfully!");
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleFetchResults = async () => {
    if (selectedElectionId === null) {
      alert("Please select an election to fetch results!");
      return;
    }

    const contract = await getContract();
    if (!contract) return;

    try {
      const data = await contract.getResults(selectedElectionId);
      setResults(data.map((res: ethers.BigNumber) => res.toNumber()));
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white-500 to-pink-500 text-gray-800 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">My Ballot</h1>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Create Election</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Election Name"
              value={electionName}
              onChange={e => setElectionName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="candidates (comma-separated)"
              value={candidates}
              onChange={e => setCandidates(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleCreateElection}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Create Election
            </button>
          </div>
        </div>

        {elections.map((election, index) => (
          <div key={index} className="bg-gray-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">{election.name}</h2>
            <p>Status: {election.isActive ? "Active" : "Inactive"}</p>
            <ul className="list-disc list-inside">
              {election.candidates.map((candidate: string, candidateIndex: number) => (
                <li key={candidateIndex}>
                  {candidateIndex}: {candidate}
                </li>
              ))}
            </ul>
            <div className="space-y-2 mt-4">
              <button
                onClick={() => handleDeactivateElection(index)}
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Deactivate Election
              </button>
              <button
                onClick={() => handleAddCandidate(index, prompt("Enter candidate name:"))}
                className="w-6/12 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Add Candidate
              </button>
              <button
                onClick={() => handleRemoveCandidate(index, Number(prompt("Enter candidate index to remove:")))}
                className="w-6/12 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                Remove Candidate
              </button>
            </div>
          </div>
        ))}

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Vote</h2>
          <div className="space-y-4">
            <select
              onChange={e => setSelectedElectionId(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value="" disabled selected>
                Select an election
              </option>
              {elections.map(election => (
                <option key={election.id} value={election.id}>
                  {election.name}
                </option>
              ))}
            </select>
            {selectedElectionId !== null && (
              <div>
                <p className="text-lg font-semibold">candidates:</p>
                <ul className="list-disc list-inside">
                  {elections[selectedElectionId]?.candidates.map((candidate: string, index: number) => (
                    <li key={index}>
                      {index}: {candidate}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <input
              type="number"
              placeholder="candidate ID"
              value={choice}
              onChange={e => setChoice(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleVote}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              Vote
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Results</h2>
          <div className="space-y-4">
            {selectedElectionId !== null && (
              <div>
                <p className="text-lg font-semibold">Results for {elections[selectedElectionId]?.name}:</p>
                <ul className="list-disc list-inside">
                  {results.map((result, index) => (
                    <li key={index}>
                      candidate {index}: {result} votes
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={handleFetchResults}
              className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
            >
              Fetch Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
