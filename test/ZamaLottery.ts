import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";

import type { ZamaLottery, ZamaLottery__factory } from "../types";

const RELAYER_SIGNER_INDEX = 6;

async function deployLotteryFixture() {
  const signers = await ethers.getSigners();
  const [deployer, player] = signers;
  const relayerAddress = await signers[RELAYER_SIGNER_INDEX].getAddress();

  const factory = (await ethers.getContractFactory("ZamaLottery")) as ZamaLottery__factory;
  const contract = (await factory.connect(deployer).deploy()) as ZamaLottery;
  await contract.waitForDeployment();

  await contract.connect(deployer).updateOracleAddress(relayerAddress);

  return {
    contract,
    deployer,
    player,
    relayerAddress,
  };
}

describe("ZamaLottery", function () {
  it("mints lottery ticket when exact price is paid", async function () {
    const { contract, player } = await loadFixture(deployLotteryFixture);

    const ticketPrice = await contract.TICKET_PRICE();

    await expect(contract.connect(player).buyTicket({ value: ticketPrice - 1n })).to.be.revertedWith(
      "Incorrect payment",
    );

    const tx = await contract.connect(player).buyTicket({ value: ticketPrice });
    await tx.wait();

    expect(await contract.balanceOf(await player.getAddress())).to.equal(1n);

    const ticket = await contract.getTicket(1n);
    expect(ticket.scratchRequested).to.equal(false);
    expect(ticket.isRevealed).to.equal(false);
    expect(ticket.isWinner).to.equal(false);
  });

  it("requests scratch and reveals ticket through mock oracle", async function () {
    if (!fhevm.isMock) {
      this.skip();
    }

    const { contract, player, deployer } = await loadFixture(deployLotteryFixture);
    const contractAddress = await contract.getAddress();

    const ticketPrice = await contract.TICKET_PRICE();
    await contract.connect(player).buyTicket({ value: ticketPrice });

    // Ensure contract can cover potential prize payment
    await deployer.sendTransaction({
      to: contractAddress,
      value: ethers.parseEther("0.10"),
    });

    const beforeBalance = await ethers.provider.getBalance(contractAddress);

    const scratchTx = await contract.connect(player).scratchTicket(1n);
    await scratchTx.wait();

    await ethers.provider.send("fhevm_awaitDecryptionOracle", []);

    const ticket = await contract.getTicket(1n);
    expect(ticket.isRevealed).to.equal(true);
    expect(ticket.scratchRequested).to.equal(true);

    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      ticket.encryptedNumber,
      contractAddress,
      player,
    );

    expect(BigInt(ticket.revealedNumber)).to.equal(decrypted);

    if (ticket.isWinner) {
      const afterBalance = await ethers.provider.getBalance(contractAddress);
      const prizeAmount = await contract.PRIZE_AMOUNT();
      if (!ticket.prizePending) {
        expect(ticket.prizeClaimed).to.equal(true);
        expect(beforeBalance - afterBalance).to.be.gte(prizeAmount);
      } else {
        expect(ticket.prizeClaimed).to.equal(false);
      }
    } else {
      expect(ticket.prizeClaimed).to.equal(false);
      expect(ticket.prizePending).to.equal(false);
      await expect(contract.connect(player).claimPrize(1n)).to.be.revertedWith("Not a winning ticket");
    }
  });
});
