# Z Lottery 🎰

A decentralized, privacy-preserving lottery system built on Ethereum using Zama's Fully Homomorphic Encryption (FHE) technology. Players purchase NFT-based lottery tickets with encrypted random numbers that can be "scratched" to reveal winning results, ensuring fairness and transparency without compromising privacy.

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technologies Used](#technologies-used)
- [Advantages](#advantages)
- [Problems Solved](#problems-solved)
- [Installation](#installation)
- [Usage](#usage)
- [Contract Architecture](#contract-architecture)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Roadmap](#future-roadmap)
- [Security Considerations](#security-considerations)
- [License](#license)
- [Support](#support)

## 🎯 Overview

Z Lottery is a revolutionary blockchain-based lottery system that leverages Fully Homomorphic Encryption (FHE) to create a provably fair, transparent, and privacy-preserving gaming experience. Unlike traditional lotteries that rely on trusted third parties or centralized random number generators, Z Lottery uses cryptographic encryption to ensure that lottery numbers remain confidential until they are revealed, preventing any possibility of manipulation.

Each lottery ticket is an ERC721 NFT containing an encrypted random number. Players can "scratch" their tickets to request decryption through Zama's oracle network, revealing whether they've won. The winning condition is simple: all four digits of the revealed number must be identical (e.g., 0000, 1111, 2222, ..., 9999).

### Why Z Lottery?

- **True Randomness**: Cryptographically secure random number generation using blockchain properties
- **Privacy-First**: Numbers remain encrypted until scratched, ensuring no one can peek at results
- **Provably Fair**: All lottery logic is transparent and verifiable on-chain
- **No Intermediaries**: Smart contracts handle everything automatically
- **NFT Ownership**: Tickets are tradeable ERC721 tokens

## ✨ Key Features

### 🎫 NFT-Based Tickets
- Each lottery ticket is an ERC721 NFT
- Fully transferable and tradeable
- Persistent ownership record on-chain
- Custom metadata and token URI support

### 🔐 Fully Homomorphic Encryption
- Random numbers encrypted using Zama's FHEVM
- Numbers remain confidential until player requests reveal
- Computations performed on encrypted data
- Oracle-based decryption for transparency

### 🎲 Fair Random Number Generation
- Uses blockchain properties for randomness
- Combines multiple entropy sources: `block.prevrandao`, blockhash, buyer address, token ID
- 4-digit numbers (0000-9999) with modulo operation
- Deterministic yet unpredictable

### 💰 Automated Prize Distribution
- Instant prize payouts for winners (when contract has sufficient balance)
- Deferred prize system when funds are temporarily insufficient
- Prize claiming mechanism for pending rewards
- Transparent prize tracking

### 🔄 Scratch-Off Mechanism
- Players trigger decryption by "scratching" tickets
- Asynchronous reveal process via oracle
- Event-driven architecture for transparency
- Request ID tracking for debugging

### 📊 Complete Ticket Lifecycle
1. **Purchase**: Pay 0.001 ETH to mint a ticket NFT
2. **Hold**: Ticket contains encrypted number
3. **Scratch**: Request decryption to reveal number
4. **Reveal**: Oracle decrypts and checks for winners
5. **Claim**: Automatic or manual prize claiming

## 🔄 How It Works

### Step 1: Buying a Ticket

```solidity
function buyTicket() external payable returns (uint256 tokenId)
```

1. Player sends exactly 0.001 ETH to the contract
2. Contract mints a new ERC721 NFT to the player
3. A random 4-digit number (0000-9999) is generated using:
   - `block.prevrandao` (Ethereum's randomness beacon)
   - Previous block hash
   - Buyer's address
   - Token ID
   - Contract address
4. The number is encrypted using FHE and stored on-chain
5. Ticket metadata initialized with default state

### Step 2: Scratching the Ticket

```solidity
function scratchTicket(uint256 tokenId) external
```

1. Ticket owner calls `scratchTicket()`
2. Contract validates ownership and ticket state
3. Decryption request sent to Zama Oracle
4. Request ID stored for tracking
5. Ticket marked as "scratch requested"

### Step 3: Oracle Fulfillment

```solidity
function fulfillScratch(uint256 requestId, bytes calldata cleartexts, bytes calldata decryptionProof) external
```

1. Zama Oracle decrypts the encrypted number off-chain
2. Oracle calls `fulfillScratch()` with decrypted result
3. Contract verifies oracle's signature
4. Revealed number stored on-chain
5. Winning logic executed: checks if all 4 digits are identical
6. If winner, automated prize distribution triggered
7. Events emitted for transparency

### Step 4: Prize Distribution

```solidity
function _handlePrize(uint256 tokenId, address recipient) private
```

- **Sufficient Balance**: Prize (0.01 ETH) sent immediately
- **Insufficient Balance**: Prize marked as pending, can be claimed later
- `PrizePaid` or `PrizePending` event emitted

### Winning Condition

A ticket wins if all four digits of the revealed number are identical:

```solidity
function _isWinningNumber(uint32 number) private pure returns (bool) {
    uint32 thousands = number / 1000;
    uint32 hundreds = (number / 100) % 10;
    uint32 tens = (number / 10) % 10;
    uint32 units = number % 10;
    return thousands == hundreds && hundreds == tens && tens == units;
}
```

**Winning Numbers**: 0000, 1111, 2222, 3333, 4444, 5555, 6666, 7777, 8888, 9999

**Winning Probability**: 10 / 10,000 = 0.1% (1 in 1,000)

## 🛠 Technologies Used

### Blockchain & Smart Contracts
- **Solidity 0.8.27**: Smart contract programming language
- **Ethereum**: Blockchain platform (Sepolia testnet supported)
- **ERC721**: NFT standard for lottery tickets
- **Hardhat**: Development framework and testing environment

### Zama FHEVM Stack
- **@fhevm/solidity (v0.8.0)**: Core FHE operations library
- **@fhevm/hardhat-plugin (v0.1.0)**: Hardhat integration for FHE
- **@zama-fhe/oracle-solidity (v0.1.0)**: Decryption oracle interfaces
- **@zama-fhe/relayer-sdk (v0.2.0)**: Oracle communication utilities
- **encrypted-types (v0.0.4)**: TypeScript types for encrypted values

### Development Tools
- **TypeScript**: Type-safe development environment
- **Ethers.js v6**: Ethereum library for contract interaction
- **Hardhat Deploy**: Deployment management
- **Hardhat Verify**: Contract verification on Etherscan
- **TypeChain**: TypeScript bindings for contracts

### Testing & Quality Assurance
- **Mocha & Chai**: Testing framework and assertions
- **Hardhat Network Helpers**: Testing utilities
- **Solidity Coverage**: Code coverage analysis
- **Gas Reporter**: Gas optimization tracking
- **ESLint & Prettier**: Code quality and formatting
- **Solhint**: Solidity linting

### Security & Cryptography
- **Fully Homomorphic Encryption (FHE)**: Privacy-preserving computations
- **euint32**: 32-bit encrypted unsigned integers
- **Zama Oracle**: Decentralized decryption service
- **Signature Verification**: Oracle proof validation

## 🚀 Advantages

### 1. **Privacy-Preserving by Design**
- Lottery numbers encrypted using FHE technology
- No one (including contract owner) can view numbers before reveal
- Computational operations performed on encrypted data
- Zero-knowledge proof compatibility

### 2. **Provably Fair**
- All lottery logic is open-source and verifiable
- Random number generation uses blockchain entropy
- Winning conditions are deterministic and transparent
- No possibility of manipulation or rigging

### 3. **Fully Decentralized**
- No trusted third parties required
- Smart contracts handle all operations autonomously
- Oracle network provides decentralized decryption
- Immutable rules enforced by blockchain

### 4. **Transparent Yet Private**
- All transactions visible on-chain
- Prize distributions are auditable
- Ticket purchases and reveals tracked via events
- Numbers remain private until deliberately revealed

### 5. **Cost-Effective**
- Low ticket price (0.001 ETH ≈ $3-4 USD)
- Attractive prize pool (0.01 ETH ≈ $30-40 USD)
- 10x return on investment for winners
- Gas-optimized contract implementation

### 6. **NFT Integration**
- Tickets are fully-fledged ERC721 NFTs
- Can be traded on OpenSea and other NFT marketplaces
- Collectible value beyond lottery functionality
- Support for metadata and custom URIs

### 7. **Flexible Prize System**
- Immediate payouts when possible
- Deferred claiming for pending prizes
- Manual claiming option for delayed rewards
- Owner can add funds to support prize pool

### 8. **Developer-Friendly**
- Comprehensive test suite included
- Hardhat tasks for common operations
- TypeScript support throughout
- Detailed documentation and examples

## 🎯 Problems Solved

### Problem 1: Lack of Trust in Traditional Lotteries
**Traditional Issue**: Players must trust lottery operators to conduct fair drawings and pay out prizes honestly.

**Zama Solution**: All lottery logic is encoded in immutable smart contracts. Winning conditions are transparent, and prize payouts are automatic. No human intervention possible.

### Problem 2: Centralized Random Number Generation
**Traditional Issue**: Random numbers generated by centralized services can potentially be manipulated or predicted.

**Zama Solution**: Random numbers generated using blockchain-native entropy sources (block randomness, hashes) combined with player-specific data. Result is encrypted immediately, preventing any tampering.

### Problem 3: Privacy Concerns
**Traditional Issue**: Traditional blockchain lotteries expose all numbers publicly, potentially enabling statistical attacks or pattern recognition.

**Zama Solution**: FHE keeps numbers encrypted until player chooses to reveal. Even contract owner cannot peek at unrevealed tickets.

### Problem 4: Complex Prize Distribution
**Traditional Issue**: Manual prize claims require user action, can be lost or forgotten, and involve high gas costs for bulk distributions.

**Zama Solution**: Automatic prize distribution upon ticket reveal. Pending prizes can be claimed anytime. Efficient single-transaction payouts.

### Problem 5: Regulatory Compliance
**Traditional Issue**: Many jurisdictions require lottery transparency and fairness guarantees.

**Zama Solution**: Complete audit trail on-chain. Provably fair algorithms. Transparent prize pools. Open-source code available for regulatory review.

### Problem 6: High Operational Costs
**Traditional Issue**: Traditional lotteries require extensive infrastructure, staff, and overhead.

**Zama Solution**: Fully automated smart contract system. No operational costs beyond blockchain gas fees. Self-sustaining prize pool model.

### Problem 7: Lack of Composability
**Traditional Issue**: Traditional lottery systems are siloed and cannot integrate with other platforms.

**Zama Solution**: ERC721 standard enables integration with entire Ethereum ecosystem. Tickets tradeable on any NFT marketplace. Compatible with DeFi protocols.

## 📦 Installation

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **Git**: For cloning the repository
- **Wallet**: MetaMask or similar for testnet interaction

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/zama-lottery.git
cd zama-lottery
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Hardhat and plugins
- Zama FHEVM libraries
- Testing frameworks
- Development tools

### Step 3: Set Up Environment Variables

Create a `.env` file or use Hardhat vars:

```bash
# Set your private key (for deployment)
npx hardhat vars set PRIVATE_KEY

# Set Infura API key (for Sepolia testnet)
npx hardhat vars set INFURA_API_KEY

# Optional: Etherscan API key (for contract verification)
npx hardhat vars set ETHERSCAN_API_KEY
```

Alternatively, create a `.env` file:

```env
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Step 4: Compile Contracts

```bash
npm run compile
```

This generates:
- Contract artifacts in `./artifacts`
- TypeScript bindings in `./types`
- ABI files for frontend integration

### Step 5: Run Tests

```bash
npm run test
```

Verify all tests pass before deployment.

## 🎮 Usage

### Local Development

#### Start Local Hardhat Node

```bash
# Terminal 1: Start FHEVM-ready local node
npm run chain
```

#### Deploy to Local Network

```bash
# Terminal 2: Deploy contracts
npm run deploy:localhost
```

#### Interact with Contracts via Hardhat Tasks

##### Get Contract Address

```bash
npx hardhat task:lottery-address --network localhost
```

Output:
```
ZamaLottery address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

##### Buy a Lottery Ticket

```bash
npx hardhat task:lottery-buy --network localhost
```

Output:
```
Buying ticket... tx=0x1234...
Ticket id: 1
Encrypted handle: 0xabcd...
```

##### Scratch a Ticket

```bash
npx hardhat task:lottery-scratch --tokenid 1 --network localhost
```

Output:
```
Scratch requested. tx=0x5678...
Request id: 1
```

On mock networks, the oracle fulfills automatically.

##### Check Ticket Information

```bash
npx hardhat task:lottery-info --tokenid 1 --network localhost
```

Output:
```
Token 1 info:
  Scratch requested: true
  Revealed: true
  Winner: true
  Prize claimed: true
  Prize pending: false
  Request id: 1
  Revealed number: 7777
```

##### Decrypt Ticket (Dev Networks Only)

```bash
npx hardhat task:lottery-info --tokenid 1 --decrypt --network localhost
```

Output:
```
Token 1 info:
  ...
  Decrypted number: 7777
```

### Testnet Deployment (Sepolia)

#### Deploy to Sepolia

```bash
npm run deploy:sepolia
```

#### Verify Contract on Etherscan

```bash
npm run verify:sepolia <CONTRACT_ADDRESS>
```

#### Test on Sepolia

```bash
npm test:sepolia
```

**Note**: On Sepolia, oracle responses may take 1-2 minutes to process.

### Programmatic Interaction

#### Using Ethers.js

```typescript
import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  // Get contract instance
  const lotteryAddress = "0x...";
  const lottery = await ethers.getContractAt("ZamaLottery", lotteryAddress);

  // Buy ticket
  const ticketPrice = await lottery.TICKET_PRICE();
  const tx = await lottery.buyTicket({ value: ticketPrice });
  await tx.wait();
  console.log("Ticket purchased!");

  // Get user's tickets
  const tickets = await lottery.tokensOfOwner(signer.address);
  console.log("My tickets:", tickets);

  // Scratch first ticket
  if (tickets.length > 0) {
    const scratchTx = await lottery.scratchTicket(tickets[0]);
    await scratchTx.wait();
    console.log("Scratch requested!");
  }
}
```

## 🏗 Contract Architecture

### Contract Hierarchy

```
ZamaLottery
├── MinimalERC721 (custom NFT implementation)
│   ├── ERC165 (interface detection)
│   ├── IERC721 (NFT standard)
│   └── IERC721Metadata (NFT metadata)
└── SepoliaConfig (Zama FHEVM configuration)
```

### Core Components

#### 1. **MinimalERC721**
Custom, gas-optimized ERC721 implementation with:
- Token ownership tracking
- Approval management
- Transfer functionality
- Token enumeration (tokensOfOwner)
- Safe transfer with receiver checks

#### 2. **ZamaLottery**
Main lottery logic contract:
- Ticket purchasing and minting
- Random number generation and encryption
- Scratch request handling
- Oracle callback fulfillment
- Prize distribution logic
- Owner administrative functions

### State Variables

```solidity
// Constants
uint256 public constant TICKET_PRICE = 0.001 ether;
uint256 public constant PRIZE_AMOUNT = 0.01 ether;
uint32 private constant MAX_NUMBER = 10_000;

// State
address private immutable _owner;
uint256 private _nextTokenId = 1;
address private _oracleAddress;
mapping(uint256 => TicketData) private _tickets;
mapping(uint256 => uint256) private _pendingRequests;
```

### Data Structures

#### TicketData

```solidity
struct TicketData {
    euint32 encryptedNumber;    // FHE-encrypted random number
    uint32 revealedNumber;       // Decrypted number (0 until revealed)
    uint256 requestId;           // Oracle decryption request ID
    bool scratchRequested;       // Whether scratch has been requested
    bool isRevealed;             // Whether number has been decrypted
    bool isWinner;               // Whether ticket won prize
    bool prizeClaimed;           // Whether prize has been paid
    bool prizePending;           // Whether prize is pending due to low balance
}
```

### Key Functions

| Function | Visibility | Description |
|----------|-----------|-------------|
| `buyTicket()` | external payable | Purchase lottery ticket NFT |
| `scratchTicket(uint256)` | external | Request ticket decryption |
| `fulfillScratch(uint256, bytes, bytes)` | external | Oracle callback for reveal |
| `claimPrize(uint256)` | external | Claim pending prize |
| `getTicket(uint256)` | external view | Get ticket information |
| `ticketNumbers(address)` | external view | Get user's ticket IDs |
| `withdraw(address, uint256)` | external onlyOwner | Withdraw contract funds |
| `updateOracleAddress(address)` | external onlyOwner | Update oracle address |

### Events

```solidity
event TicketPurchased(address indexed buyer, uint256 indexed tokenId, euint32 encryptedNumber);
event ScratchRequested(uint256 indexed tokenId, uint256 indexed requestId);
event TicketRevealed(uint256 indexed tokenId, uint32 revealedNumber, bool winner);
event PrizePaid(uint256 indexed tokenId, address indexed recipient, uint256 amount);
event PrizePending(uint256 indexed tokenId, address indexed recipient, uint256 amount);
event FundsAdded(address indexed sender, uint256 amount);
event FundsWithdrawn(address indexed recipient, uint256 amount);
event OracleAddressUpdated(address indexed previousOracle, address indexed newOracle);
```

### Access Control

- **Public Functions**: buyTicket, scratchTicket, claimPrize, view functions
- **Owner Only**: withdraw, updateOracleAddress
- **Oracle Only**: fulfillScratch
- **Internal**: Prize handling, random number generation, winning check

## 🧪 Testing

### Test Structure

```
test/
└── ZamaLottery.ts    # Comprehensive test suite
```

### Test Coverage

#### 1. **Basic Functionality Tests**
- ✅ Ticket purchase with exact payment
- ✅ Revert on incorrect payment amount
- ✅ NFT minting and ownership
- ✅ Initial ticket state verification

#### 2. **Scratch and Reveal Tests**
- ✅ Scratch request initiation
- ✅ Oracle fulfillment on mock network
- ✅ Decryption correctness
- ✅ Winner determination
- ✅ Prize payout logic

#### 3. **Edge Cases**
- ✅ Insufficient balance handling
- ✅ Pending prize claims
- ✅ Non-owner scratch prevention
- ✅ Duplicate scratch prevention
- ✅ Invalid token ID handling

### Running Tests

#### Run All Tests

```bash
npm test
```

#### Run with Coverage

```bash
npm run coverage
```

Coverage report generated in `./coverage/`

#### Run with Gas Reporting

```bash
REPORT_GAS=true npm test
```

#### Run on Specific Network

```bash
npm run test:sepolia
```

### Test Example

```typescript
it("mints lottery ticket when exact price is paid", async function () {
  const { contract, player } = await loadFixture(deployLotteryFixture);

  const ticketPrice = await contract.TICKET_PRICE();

  // Should revert with incorrect payment
  await expect(
    contract.connect(player).buyTicket({ value: ticketPrice - 1n })
  ).to.be.revertedWith("Incorrect payment");

  // Should succeed with correct payment
  const tx = await contract.connect(player).buyTicket({ value: ticketPrice });
  await tx.wait();

  // Verify NFT minted
  expect(await contract.balanceOf(await player.getAddress())).to.equal(1n);

  // Verify ticket state
  const ticket = await contract.getTicket(1n);
  expect(ticket.scratchRequested).to.equal(false);
  expect(ticket.isRevealed).to.equal(false);
  expect(ticket.isWinner).to.equal(false);
});
```

### Mock Oracle Testing

The FHEVM plugin provides a mock oracle for testing:

```typescript
// Request scratch
await contract.scratchTicket(1n);

// Wait for mock oracle to fulfill
await ethers.provider.send("fhevm_awaitDecryptionOracle", []);

// Verify reveal
const ticket = await contract.getTicket(1n);
expect(ticket.isRevealed).to.equal(true);
```

## 🚀 Deployment

### Deployment Script

Location: `deploy/deploy.ts`

```typescript
const deployedLottery = await deploy("ZamaLottery", {
  from: deployer,
  log: true,
});
```

### Network Configuration

Supported networks in `hardhat.config.ts`:

#### Local Development
- **hardhat**: Default local network (chainId: 31337)
- **localhost**: Local node at http://localhost:8545

#### Testnets
- **sepolia**: Ethereum Sepolia testnet (chainId: 11155111)

### Deployment Steps

#### 1. Local Deployment

```bash
# Terminal 1: Start node
npm run chain

# Terminal 2: Deploy
npm run deploy:localhost
```

#### 2. Sepolia Deployment

```bash
# Ensure environment variables are set
npx hardhat vars set PRIVATE_KEY
npx hardhat vars set INFURA_API_KEY

# Deploy
npm run deploy:sepolia

# Verify (optional)
npm run verify:sepolia <CONTRACT_ADDRESS>
```

### Post-Deployment

#### Fund the Contract

The contract needs ETH to pay prizes:

```bash
# Send ETH to contract
npx hardhat send --to <CONTRACT_ADDRESS> --amount 0.1 --network sepolia
```

Or programmatically:

```typescript
await signer.sendTransaction({
  to: contractAddress,
  value: ethers.parseEther("0.1")
});
```

#### Update Oracle Address (if needed)

```typescript
await lottery.updateOracleAddress(newOracleAddress);
```

#### Verify Deployment

```bash
# Check contract address
npx hardhat task:lottery-address --network sepolia

# Buy test ticket
npx hardhat task:lottery-buy --network sepolia

# Check ticket
npx hardhat task:lottery-info --tokenid 1 --network sepolia
```

## 🗺 Future Roadmap

### Phase 1: Core Enhancements (Q2 2025)

#### Multiple Prize Tiers
- **Bronze**: 3 matching digits → 0.005 ETH
- **Silver**: 3 matching digits + special pattern → 0.01 ETH
- **Gold**: All 4 matching digits → 0.1 ETH
- **Jackpot**: Sequential matches (e.g., 0000) → Progressive jackpot

#### Dynamic Prize Pools
- Percentage of ticket sales go to prize pool
- Progressive jackpot system
- Rollover mechanism for unclaimed prizes
- Minimum prize guarantees

#### Batch Operations
- Buy multiple tickets in single transaction
- Batch scratching for gas optimization
- Bulk prize claiming
- Multi-ticket discount pricing

### Phase 2: User Experience (Q3 2025)

#### Frontend DApp
- React-based web interface
- MetaMask integration
- Real-time ticket status updates
- Prize claim notifications
- Historical ticket viewer
- User statistics dashboard

#### Enhanced Metadata
- Dynamic NFT images based on ticket state
- Rarity attributes for collectible value
- Custom artwork for winning tickets
- IPFS metadata storage
- On-chain SVG generation

#### Social Features
- Leaderboard for biggest winners
- Ticket gifting mechanism
- Group buy pools
- Referral rewards system

### Phase 3: Advanced Features (Q4 2025)

#### Secondary Market Support
- Direct marketplace integration
- Ticket trading before reveal
- Price discovery mechanisms
- Royalty system for original buyer

#### Cross-Chain Expansion
- Polygon deployment for lower fees
- Arbitrum support for faster reveals
- Bridge mechanism for tickets
- Multi-chain prize pools

#### Governance & Tokenomics
- Governance token (ZLOT) for parameter control
- DAO for prize pool management
- Staking mechanisms
- Token holder rewards

### Phase 4: Enterprise & Compliance (2026)

#### Regulatory Compliance
- KYC/AML integration options
- Jurisdiction-specific prize limits
- Tax reporting tools
- License management system

#### Analytics & Reporting
- Real-time statistics dashboard
- Prize pool analytics
- Player behavior insights
- Revenue reporting tools

#### API & Integrations
- REST API for third-party integrations
- Webhook support for events
- SDK for mobile apps
- White-label solution

### Phase 5: Innovation (Future)

#### Advanced Cryptography
- Zero-knowledge proofs for privacy
- Verifiable random functions (VRF) integration
- Threshold encryption for distributed trust
- Multi-party computation

#### GameFi Integration
- Play-to-earn mechanics
- Staking tickets for rewards
- Lottery tournaments
- Achievement system and badges

#### AI & Predictive Analytics
- Pattern analysis (ethical disclosure)
- Prize pool optimization
- Fraud detection
- Player retention algorithms

## 🔒 Security Considerations

### Cryptographic Security

#### FHE Properties
- **Semantic Security**: Encrypted numbers reveal no information about plaintext
- **Deterministic Encryption**: Same number encrypts differently each time
- **Tamper-Proof**: Cannot modify encrypted values without detection

#### Random Number Generation
- Multiple entropy sources combined
- Block randomness via `prevrandao`
- Player-specific salt
- Modulo operation for uniform distribution

### Smart Contract Security

#### Access Control
- Owner-only administrative functions
- Oracle-only callback functions
- Ticket owner-only operations
- Reentrancy guards on prize payouts

#### Edge Cases Handled
- Insufficient balance for prizes → Deferred claiming
- Oracle timeout/failure → Can re-request scratch
- Duplicate scratch requests → Rejected
- Invalid token IDs → Proper error handling

#### Gas Optimization
- Efficient storage layout
- Minimal state changes
- Batch operation support (future)
- View function caching

### Operational Security

#### Owner Responsibilities
- Secure private key management
- Multi-sig wallet recommended
- Regular contract funding
- Oracle address updates

#### Oracle Trust Assumptions
- Relies on Zama Oracle for decryption
- Signature verification for proof
- Fallback mechanisms planned (future)
- Oracle address update capability

### Audit Status

⚠️ **This contract has not been audited yet.** Use at your own risk.

**Recommended before mainnet:**
- Professional smart contract audit
- Formal verification of lottery logic
- Penetration testing
- Economic attack analysis

### Known Limitations

1. **Oracle Dependency**: Contract relies on Zama Oracle for reveals
2. **Pending Prizes**: Winners may need to claim if balance is low
3. **Gas Costs**: Scratch operation requires oracle callback gas
4. **Winning Odds**: Fixed at 0.1% (10/10,000)

### Best Practices for Users

- ✅ Only use testnet ETH for testing
- ✅ Verify contract address before interaction
- ✅ Keep track of your ticket NFTs
- ✅ Claim prizes promptly
- ✅ Use hardware wallet for large amounts
- ❌ Don't share private keys
- ❌ Don't scratch tickets you don't own
- ❌ Don't send ETH directly without using buyTicket()

## 📜 License

This project is licensed under the **BSD-3-Clause-Clear License**.

### Key Points

- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ Patent use NOT granted
- ⚠️ No warranty provided
- ⚠️ No liability accepted

See the [LICENSE](LICENSE) file for full details.

## 📞 Support

### Documentation
- **FHEVM Docs**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Hardhat Docs**: [https://hardhat.org/docs](https://hardhat.org/docs)
- **Solidity Docs**: [https://docs.soliditylang.org](https://docs.soliditylang.org)

### Community
- **Zama Discord**: [https://discord.gg/zama](https://discord.gg/zama)
- **Zama Forum**: [https://community.zama.ai](https://community.zama.ai)
- **Twitter**: [@zama_fhe](https://twitter.com/zama_fhe)

### Issues & Bugs
- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/zama-lottery/issues)
- **Security Issues**: Please report privately to security@yourdomain.com

### Contributing
We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

### Acknowledgments

Built with technologies from:
- **[Zama](https://zama.ai)** - Fully Homomorphic Encryption
- **[Ethereum](https://ethereum.org)** - Blockchain platform
- **[Hardhat](https://hardhat.org)** - Development framework
- **[OpenZeppelin](https://openzeppelin.com)** - Security standards

---

**🎰 Built with ❤️ and FHE**

*May the odds be ever in your favor!*
