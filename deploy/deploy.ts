import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedLottery = await deploy("ZamaLottery", {
    from: deployer,
    log: true,
  });

  console.log(`ZamaLottery contract: `, deployedLottery.address);
};
export default func;
func.id = "deploy_zamaLottery"; // id required to prevent reexecution
func.tags = ["ZamaLottery"];
