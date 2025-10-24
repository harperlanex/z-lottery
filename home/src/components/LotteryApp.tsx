import { useEffect, useMemo, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ethers } from 'ethers';
import type { Abi } from 'viem';

import { CONTRACT_ABI, DEFAULT_CONTRACT_ADDRESS, SEPOLIA_CHAIN_ID } from '../config/contracts';
import '../styles/LotteryApp.css';

type TicketRecord = {
  tokenId: bigint;
  encryptedNumber: string;
  revealedNumber: number;
  requestId: bigint;
  scratchRequested: boolean;
  isRevealed: boolean;
  isWinner: boolean;
  prizeClaimed: boolean;
  prizePending: boolean;
};

type Summary = {
  ticketPrice: bigint;
  prizeAmount: bigint;
  totalSupply: bigint;
  owner: string;
  contractBalance: bigint;
};

const abi = CONTRACT_ABI as unknown as Abi;

function isValidAddress(value: string): boolean {
  try {
    return ethers.isAddress(value);
  } catch {
    return false;
  }
}

function formatEtherAmount(value: bigint): string {
  return `${ethers.formatEther(value)} ETH`;
}

function formatTicketNumber(value: number): string {
  const padded = value.toString().padStart(4, '0');
  return padded;
}

function TicketCard({
  ticket,
  onScratch,
  onClaim,
  isProcessing,
}: {
  ticket: TicketRecord;
  onScratch: (tokenId: bigint) => Promise<void>;
  onClaim: (tokenId: bigint) => Promise<void>;
  isProcessing: boolean;
}) {
  const status = useMemo(() => {
    if (!ticket.scratchRequested) {
      return 'Ready to scratch';
    }
    if (!ticket.isRevealed) {
      return 'Decrypting on-chain';
    }
    if (ticket.isWinner && ticket.prizeClaimed) {
      return 'Prize claimed';
    }
    if (ticket.isWinner && ticket.prizePending) {
      return 'Winner - awaiting payout';
    }
    if (ticket.isWinner) {
      return 'Winner - claim available';
    }
    return 'Revealed';
  }, [ticket]);

  return (
    <div className="ticket-card">
      <header className="ticket-card__header">
        <span className="ticket-card__id">Ticket #{ticket.tokenId.toString()}</span>
        <span className={`ticket-card__status ${ticket.isWinner ? 'ticket-card__status--winner' : ''}`}>{status}</span>
      </header>
      <div className="ticket-card__body">
        <div className="ticket-card__row">
          <span className="ticket-card__label">Encrypted handle</span>
          <span className="ticket-card__value">{ticket.encryptedNumber}</span>
        </div>
        <div className="ticket-card__row">
          <span className="ticket-card__label">Request id</span>
          <span className="ticket-card__value">{ticket.requestId.toString()}</span>
        </div>
        <div className="ticket-card__row">
          <span className="ticket-card__label">Revealed number</span>
          <span className="ticket-card__value">
            {ticket.isRevealed ? formatTicketNumber(ticket.revealedNumber) : 'Hidden'}
          </span>
        </div>
      </div>
      <footer className="ticket-card__footer">
        <button
          className="ticket-card__button"
          disabled={isProcessing || ticket.scratchRequested}
          onClick={() => onScratch(ticket.tokenId)}
        >
          Scratch
        </button>
        <button
          className="ticket-card__button ticket-card__button--primary"
          disabled={
            isProcessing || !ticket.isWinner || ticket.prizeClaimed || !ticket.isRevealed
          }
          onClick={() => onClaim(ticket.tokenId)}
        >
          Claim prize
        </button>
      </footer>
    </div>
  );
}

export function LotteryApp() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const [contractAddress, setContractAddress] = useState<string>(DEFAULT_CONTRACT_ADDRESS);
  const [manualAddress, setManualAddress] = useState<string>(DEFAULT_CONTRACT_ADDRESS);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);

  const normalizedAddress = contractAddress.trim();
  const contractReady = isValidAddress(normalizedAddress);

  const summaryQuery = useQuery<Summary>({
    queryKey: ['lottery-summary', normalizedAddress],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error('Missing client');
      }
      const [ticketPrice, prizeAmount, totalSupply, owner, contractBalance] = await Promise.all([
        publicClient.readContract({ address: normalizedAddress as `0x${string}`, abi, functionName: 'TICKET_PRICE' }),
        publicClient.readContract({ address: normalizedAddress as `0x${string}`, abi, functionName: 'PRIZE_AMOUNT' }),
        publicClient.readContract({ address: normalizedAddress as `0x${string}`, abi, functionName: 'totalSupply' }),
        publicClient.readContract({ address: normalizedAddress as `0x${string}`, abi, functionName: 'owner' }),
        publicClient.getBalance({ address: normalizedAddress as `0x${string}` }),
      ]);
      return {
        ticketPrice: ticketPrice as bigint,
        prizeAmount: prizeAmount as bigint,
        totalSupply: totalSupply as bigint,
        owner: owner as string,
        contractBalance,
      };
    },
    enabled: contractReady && !!publicClient,
    refetchOnReconnect: true,
  });

  const ticketsQuery = useQuery<TicketRecord[]>({
    queryKey: ['lottery-tickets', normalizedAddress, address ?? ''],
    queryFn: async () => {
      if (!publicClient || !address) {
        return [];
      }
      const rawIds = (await publicClient.readContract({
        address: normalizedAddress as `0x${string}`,
        abi,
        functionName: 'ticketNumbers',
        args: [address],
      })) as bigint[];

      const tickets = await Promise.all(
        rawIds.map(async (tokenId) => {
          const ticket = await publicClient.readContract({
            address: normalizedAddress as `0x${string}`,
            abi,
            functionName: 'getTicket',
            args: [tokenId],
          });

          const [encryptedNumber, revealedNumber, requestId, scratchRequested, isRevealed, isWinner, prizeClaimed, prizePending] = ticket as [
            string,
            number,
            bigint,
            boolean,
            boolean,
            boolean,
            boolean,
            boolean,
          ];

          return {
            tokenId,
            encryptedNumber,
            revealedNumber,
            requestId,
            scratchRequested,
            isRevealed,
            isWinner,
            prizeClaimed,
            prizePending,
          } satisfies TicketRecord;
        }),
      );

      tickets.sort((a, b) => Number(b.tokenId - a.tokenId));
      return tickets;
    },
    enabled: contractReady && !!publicClient && !!address,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (!publicClient || !contractReady) {
      return;
    }
    const unwatch = publicClient.watchContractEvent({
      address: normalizedAddress as `0x${string}`,
      abi,
      onLogs: () => {
        queryClient.invalidateQueries({ queryKey: ['lottery-summary', normalizedAddress] });
        queryClient.invalidateQueries({ queryKey: ['lottery-tickets', normalizedAddress, address ?? ''] });
      },
    });
    return () => {
      unwatch?.();
    };
  }, [publicClient, contractReady, normalizedAddress, queryClient, address]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['lottery-summary', normalizedAddress] });
    queryClient.invalidateQueries({ queryKey: ['lottery-tickets', normalizedAddress, address ?? ''] });
  };

  const ensureSigner = async () => {
    if (!isConnected) {
      throw new Error('Connect wallet to continue');
    }
    if (!contractReady) {
      throw new Error('Provide a valid contract address');
    }
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return { signer, provider };
  };

  const handleBuyTicket = async () => {
    setProcessingMessage('Submitting purchase...');
    try {
      const { signer } = await ensureSigner();
      const contract = new ethers.Contract(normalizedAddress, CONTRACT_ABI, signer);
      let value = summaryQuery.data?.ticketPrice ?? ethers.parseEther('0.001');
      const tx = await contract.buyTicket({ value });
      await tx.wait();
      handleRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingMessage(null);
    }
  };

  const handleScratchTicket = async (tokenId: bigint) => {
    setProcessingMessage(`Scratching ticket #${tokenId.toString()}...`);
    try {
      const { signer } = await ensureSigner();
      const contract = new ethers.Contract(normalizedAddress, CONTRACT_ABI, signer);
      const tx = await contract.scratchTicket(tokenId);
      await tx.wait();
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingMessage(null);
    }
  };

  const handleClaimPrize = async (tokenId: bigint) => {
    setProcessingMessage(`Claiming prize for ticket #${tokenId.toString()}...`);
    try {
      const { signer } = await ensureSigner();
      const contract = new ethers.Contract(normalizedAddress, CONTRACT_ABI, signer);
      const tx = await contract.claimPrize(tokenId);
      await tx.wait();
      handleRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingMessage(null);
    }
  };

  const ownershipNotice = useMemo(() => {
    if (!summaryQuery.data || !address) {
      return null;
    }
    if (summaryQuery.data.owner.toLowerCase() === address.toLowerCase()) {
      return 'You are the contract owner. Fund the contract to cover prizes before users scratch tickets.';
    }
    return null;
  }, [summaryQuery.data, address]);

  return (
    <div className="lottery-app">
      <header className="lottery-app__header">
        <div className="lottery-app__brand">
          <h1>Zama Lottery</h1>
          <p>Encrypted scratch-off tickets on Sepolia</p>
        </div>
        <ConnectButton />
      </header>

      <section className="lottery-app__contract">
        <div className="lottery-app__field">
          <label htmlFor="contractAddress">Contract address (Sepolia)</label>
          <div className="lottery-app__address-input">
            <input
              id="contractAddress"
              type="text"
              value={manualAddress}
              onChange={(event) => setManualAddress(event.target.value)}
              placeholder="0x..."
            />
            <button
              type="button"
              onClick={() => setContractAddress(manualAddress.trim())}
              className="lottery-app__button"
            >
              Apply
            </button>
            <button type="button" onClick={handleRefresh} className="lottery-app__button">
              Refresh
            </button>
          </div>
        </div>
        {!contractReady && <p className="lottery-app__hint">Enter a valid deployed contract address to begin.</p>}
        {chainId !== SEPOLIA_CHAIN_ID && (
          <p className="lottery-app__warning">Switch your wallet to the Sepolia network.</p>
        )}
      </section>

      {summaryQuery.data && contractReady && (
        <section className="lottery-app__summary">
          <div>
            <span className="lottery-app__summary-label">Ticket price</span>
            <span className="lottery-app__summary-value">{formatEtherAmount(summaryQuery.data.ticketPrice)}</span>
          </div>
          <div>
            <span className="lottery-app__summary-label">Prize amount</span>
            <span className="lottery-app__summary-value">{formatEtherAmount(summaryQuery.data.prizeAmount)}</span>
          </div>
          <div>
            <span className="lottery-app__summary-label">Tickets minted</span>
            <span className="lottery-app__summary-value">{summaryQuery.data.totalSupply.toString()}</span>
          </div>
          <div>
            <span className="lottery-app__summary-label">Contract balance</span>
            <span className="lottery-app__summary-value">{formatEtherAmount(summaryQuery.data.contractBalance)}</span>
          </div>
        </section>
      )}

      {ownershipNotice && <p className="lottery-app__notice">{ownershipNotice}</p>}

      <section className="lottery-app__actions">
        <h2>Buy ticket</h2>
        <p>Pay 0.001 ETH to mint a confidential lottery NFT. Matching digits win 0.01 ETH.</p>
        <button
          className="lottery-app__button lottery-app__button--primary"
          disabled={!contractReady || !isConnected || processingMessage !== null}
          onClick={handleBuyTicket}
        >
          Purchase ticket
        </button>
      </section>

      <section className="lottery-app__tickets">
        <div className="lottery-app__tickets-header">
          <h2>Your tickets</h2>
          <span className="lottery-app__tickets-count">{ticketsQuery.data?.length ?? 0}</span>
        </div>
        {!isConnected && <p className="lottery-app__hint">Connect a wallet to see your tickets.</p>}
        {isConnected && contractReady && (ticketsQuery.data?.length ?? 0) === 0 && (
          <p className="lottery-app__hint">No tickets yet. Purchase one to get started.</p>
        )}
        <div className="lottery-app__ticket-grid">
          {ticketsQuery.data?.map((ticket) => (
            <TicketCard
              key={ticket.tokenId.toString()}
              ticket={ticket}
              onScratch={handleScratchTicket}
              onClaim={handleClaimPrize}
              isProcessing={processingMessage !== null}
            />
          ))}
        </div>
      </section>

      {processingMessage && <div className="lottery-app__processing">{processingMessage}</div>}
    </div>
  );
}
