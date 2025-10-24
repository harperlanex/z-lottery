export const SEPOLIA_CHAIN_ID = 11155111;

export const DEFAULT_CONTRACT_ADDRESS = "0x06d975009f520478640dB355D34E5C7BcA74B2EF";

// ABI generated from deployments/sepolia/ZamaLottery.json
export const CONTRACT_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  { inputs: [], name: "HandlesAlreadySavedForRequestID", type: "error" },
  { inputs: [], name: "InvalidKMSSignatures", type: "error" },
  { inputs: [], name: "NoHandleFoundForRequestID", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "address", name: "approved", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "Approval",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "address", name: "operator", type: "address" },
      { indexed: false, internalType: "bool", name: "approved", type: "bool" }
    ],
    name: "ApprovalForAll",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "uint256", name: "requestID", type: "uint256" }],
    name: "DecryptionFulfilled",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "sender", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "FundsAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "recipient", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "FundsWithdrawn",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "previousOracle", type: "address" },
      { indexed: true, internalType: "address", name: "newOracle", type: "address" }
    ],
    name: "OracleAddressUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "address", name: "recipient", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "PrizePaid",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "address", name: "recipient", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "PrizePending",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "requestId", type: "uint256" }
    ],
    name: "ScratchRequested",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "euint32", name: "encryptedNumber", type: "bytes32" }
    ],
    name: "TicketPurchased",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "uint32", name: "revealedNumber", type: "uint32" },
      { indexed: false, internalType: "bool", name: "winner", type: "bool" }
    ],
    name: "TicketRevealed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "Transfer",
    type: "event"
  },
  { inputs: [], name: "PRIZE_AMOUNT", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "TICKET_PRICE", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "to", type: "address" }, { internalType: "uint256", name: "tokenId", type: "uint256" }], name: "approve", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "owner", type: "address" }], name: "balanceOf", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "buyTicket", outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], stateMutability: "payable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "claimPrize", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }, { internalType: "bytes", name: "cleartexts", type: "bytes" }, { internalType: "bytes", name: "decryptionProof", type: "bytes" }], name: "fulfillScratch", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "getApproved", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getTicket",
    outputs: [
      {
        components: [
          { internalType: "euint32", name: "encryptedNumber", type: "bytes32" },
          { internalType: "uint32", name: "revealedNumber", type: "uint32" },
          { internalType: "uint256", name: "requestId", type: "uint256" },
          { internalType: "bool", name: "scratchRequested", type: "bool" },
          { internalType: "bool", name: "isRevealed", type: "bool" },
          { internalType: "bool", name: "isWinner", type: "bool" },
          { internalType: "bool", name: "prizeClaimed", type: "bool" },
          { internalType: "bool", name: "prizePending", type: "bool" }
        ],
        internalType: "struct ZamaLottery.TicketView",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  { inputs: [{ internalType: "address", name: "owner", type: "address" }, { internalType: "address", name: "operator", type: "address" }], name: "isApprovedForAll", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "name", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "oracleAddress", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "ownerOf", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }], name: "pendingTokenForRequest", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "protocolId", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "pure", type: "function" },
  { inputs: [{ internalType: "address", name: "from", type: "address" }, { internalType: "address", name: "to", type: "address" }, { internalType: "uint256", name: "tokenId", type: "uint256" }], name: "safeTransferFrom", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "from", type: "address" }, { internalType: "address", name: "to", type: "address" }, { internalType: "uint256", name: "tokenId", type: "uint256" }, { internalType: "bytes", name: "data", type: "bytes" }], name: "safeTransferFrom", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "scratchTicket", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "operator", type: "address" }, { internalType: "bool", name: "approved", type: "bool" }], name: "setApprovalForAll", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }], name: "supportsInterface", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ticketInfo",
    outputs: [
      { internalType: "euint32", name: "encryptedNumber", type: "bytes32" },
      { internalType: "uint32", name: "revealedNumber", type: "uint32" },
      { internalType: "bool", name: "isWinner", type: "bool" },
      { internalType: "bool", name: "prizeClaimed", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  { inputs: [{ internalType: "address", name: "account", type: "address" }], name: "ticketNumbers", outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "tokenURI", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "owner", type: "address" }], name: "tokensOfOwner", outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "from", type: "address" }, { internalType: "address", name: "to", type: "address" }, { internalType: "uint256", name: "tokenId", type: "uint256" }], name: "transferFrom", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "newOracle", type: "address" }], name: "updateOracleAddress", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address payable", name: "recipient", type: "address" }, { internalType: "uint256", name: "amount", type: "uint256" }], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  { stateMutability: "payable", type: "receive" }
] as const;
