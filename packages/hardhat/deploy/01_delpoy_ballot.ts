import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployBallot: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("Ballot", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  console.log("🎉 Voting contract deployed successfully!");
};

export default deployBallot;

deployBallot.tags = ["Ballot"];
