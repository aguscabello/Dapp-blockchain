const hre = require("hardhat");

async function main() {
  const ObrasRepo = await hre.ethers.getContractFactory("ObrasRepo");
  const obrasRepo = await ObrasRepo.deploy();

  await obrasRepo.waitForDeployment();
  
  const contractAddress = await obrasRepo.getAddress();
  console.log(`Contrato ObrasRepo desplegado en la dirección: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

