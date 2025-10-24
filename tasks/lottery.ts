import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

const CONTRACT_NAME = "ZamaLottery";

async function resolveContract(hre: any, address?: string) {
  const { ethers, deployments } = hre;

  if (address) {
    const contract = await ethers.getContractAt(CONTRACT_NAME, address);
    return { contract, address };
  }

  const deployment = await deployments.get(CONTRACT_NAME);
  const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);
  return { contract, address: deployment.address };
}

task("task:lottery-address", "Prints the ZamaLottery address").setAction(async (_args: TaskArguments, hre) => {
  const { deployments } = hre;
  const deployment = await deployments.get(CONTRACT_NAME);
  console.log(`${CONTRACT_NAME} address: ${deployment.address}`);
});

task("task:lottery-buy", "Purchase a lottery ticket")
  .addOptionalParam("address", "Optional ZamaLottery contract address")
  .addOptionalParam("from", "Account index to use", "0")
  .setAction(async (args: TaskArguments, hre) => {
    const { ethers } = hre;
    const { contract } = await resolveContract(hre, args.address);
    const signers = await ethers.getSigners();
    const signer = signers[Number(args.from ?? 0)];
    if (!signer) {
      throw new Error("Invalid signer index");
    }

    const price = await contract.TICKET_PRICE();
    const tx = await contract.connect(signer).buyTicket({ value: price });
    console.log(`Buying ticket... tx=${tx.hash}`);
    const receipt = await tx.wait();

    const purchaseEvent = receipt?.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return undefined;
        }
      })
      .find((parsed: any) => parsed && parsed.name === "TicketPurchased");

    if (purchaseEvent) {
      console.log(`Ticket id: ${purchaseEvent.args.tokenId.toString()}`);
      console.log(`Encrypted handle: ${purchaseEvent.args.encryptedNumber}`);
    }
  });

task("task:lottery-scratch", "Request lottery ticket decryption")
  .addParam("tokenId", "Token id to scratch")
  .addOptionalParam("address", "Optional ZamaLottery contract address")
  .setAction(async (args: TaskArguments, hre) => {
    const { ethers } = hre;
    const tokenId = BigInt(args.tokenId);
    const { contract } = await resolveContract(hre, args.address);
    const [signer] = await ethers.getSigners();

    const tx = await contract.connect(signer).scratchTicket(tokenId);
    console.log(`Scratch requested. tx=${tx.hash}`);
    const receipt = await tx.wait();

    const event = receipt?.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return undefined;
        }
      })
      .find((parsed: any) => parsed && parsed.name === "ScratchRequested");

    if (event) {
      console.log(`Request id: ${event.args.requestId.toString()}`);
    }
  });

task("task:lottery-info", "Show ticket information")
  .addParam("tokenId", "Token id to inspect")
  .addOptionalParam("address", "Optional ZamaLottery contract address")
  .addFlag("decrypt", "Attempt to decrypt the ticket number (dev networks only)")
  .setAction(async (args: TaskArguments, hre) => {
    const { ethers, fhevm } = hre;
    const tokenId = BigInt(args.tokenId);
    const { contract, address } = await resolveContract(hre, args.address);

    const info = await contract.getTicket(tokenId);
    console.log(`Token ${tokenId.toString()} info:`);
    console.log(`  Scratch requested: ${info.scratchRequested}`);
    console.log(`  Revealed: ${info.isRevealed}`);
    console.log(`  Winner: ${info.isWinner}`);
    console.log(`  Prize claimed: ${info.prizeClaimed}`);
    console.log(`  Prize pending: ${info.prizePending}`);
    console.log(`  Request id: ${info.requestId.toString()}`);
    console.log(`  Revealed number: ${info.revealedNumber}`);

    if (args.decrypt) {
      await fhevm.initializeCLIApi();
      const signers = await ethers.getSigners();
      const decrypted = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        info.encryptedNumber,
        address,
        signers[0],
      );
      console.log(`  Decrypted number: ${decrypted}`);
    }
  });
