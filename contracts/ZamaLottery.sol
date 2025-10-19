// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {SepoliaZamaOracleAddress} from "@zama-fhe/oracle-solidity/address/ZamaOracleAddress.sol";

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data)
        external
        returns (bytes4);
}

interface IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

interface IERC721Metadata is IERC721 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

abstract contract ERC165 is IERC165 {
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}

abstract contract MinimalERC721 is ERC165, IERC721Metadata {
    string private _name;
    string private _symbol;
    string private _baseTokenURI;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(address => uint256[]) private _ownedTokens;
    mapping(uint256 => uint256) private _ownedTokensIndex;

    uint256 private _totalMinted;

    constructor(string memory name_, string memory symbol_, string memory baseTokenURI_) {
        _name = name_;
        _symbol = symbol_;
        _baseTokenURI = baseTokenURI_;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC721).interfaceId
            || interfaceId == type(IERC721Metadata).interfaceId
            || super.supportsInterface(interfaceId);
    }

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return string.concat(_baseTokenURI, _toString(tokenId));
    }

    function totalSupply() public view returns (uint256) {
        return _totalMinted;
    }

    function balanceOf(address owner) public view override returns (uint256) {
        require(owner != address(0), "Zero address");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Invalid tokenId");
        return owner;
    }

    function approve(address to, uint256 tokenId) public override {
        address owner = ownerOf(tokenId);
        require(to != owner, "Approve to owner");
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "Not authorized");

        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function getApproved(uint256 tokenId) public view override returns (address) {
        require(_exists(tokenId), "Approved query for nonexistent token");
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) public override {
        require(operator != msg.sender, "Approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address owner, address operator) public view override returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        _transfer(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, data), "Transfer to non receiver");
    }

    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 length = _ownedTokens[owner].length;
        uint256[] memory result = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = _ownedTokens[owner][i];
        }
        return result;
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Mint to zero");
        require(!_exists(tokenId), "Token exists");

        _beforeTokenTransfer(address(0), to, tokenId);

        _balances[to] += 1;
        _owners[tokenId] = to;
        _addTokenToOwnerEnumeration(to, tokenId);
        _totalMinted += 1;

        emit Transfer(address(0), to, tokenId);

        require(_checkOnERC721Received(address(0), to, tokenId, ""), "Transfer to non receiver");
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "Transfer from incorrect owner");
        require(to != address(0), "Transfer to zero");

        _beforeTokenTransfer(from, to, tokenId);

        delete _tokenApprovals[tokenId];

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        _removeTokenFromOwnerEnumeration(from, tokenId);
        _addTokenToOwnerEnumeration(to, tokenId);

        emit Transfer(from, to, tokenId);
    }

    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data)
        private
        returns (bool)
    {
        if (to.code.length == 0) {
            return true;
        }

        try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
            return retval == IERC721Receiver.onERC721Received.selector;
        } catch (bytes memory reason) {
            if (reason.length == 0) {
                revert("Transfer to non receiver");
            }
            assembly {
                revert(add(32, reason), mload(reason))
            }
        }
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        _ownedTokensIndex[tokenId] = _ownedTokens[to].length;
        _ownedTokens[to].push(tokenId);
    }

    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private {
        uint256 lastTokenIndex = _ownedTokens[from].length - 1;
        uint256 tokenIndex = _ownedTokensIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];
            _ownedTokens[from][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }

        _ownedTokens[from].pop();
        delete _ownedTokensIndex[tokenId];
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual {}

    function _toString(uint256 value) private pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

contract ZamaLottery is MinimalERC721, SepoliaConfig {
    uint256 public constant TICKET_PRICE = 0.001 ether;
    uint256 public constant PRIZE_AMOUNT = 0.01 ether;
    uint32 private constant MAX_NUMBER = 10_000;

    struct TicketData {
        euint32 encryptedNumber;
        uint32 revealedNumber;
        uint256 requestId;
        bool scratchRequested;
        bool isRevealed;
        bool isWinner;
        bool prizeClaimed;
        bool prizePending;
    }

    struct TicketView {
        euint32 encryptedNumber;
        uint32 revealedNumber;
        uint256 requestId;
        bool scratchRequested;
        bool isRevealed;
        bool isWinner;
        bool prizeClaimed;
        bool prizePending;
    }

    event TicketPurchased(address indexed buyer, uint256 indexed tokenId, euint32 encryptedNumber);
    event ScratchRequested(uint256 indexed tokenId, uint256 indexed requestId);
    event TicketRevealed(uint256 indexed tokenId, uint32 revealedNumber, bool winner);
    event PrizePaid(uint256 indexed tokenId, address indexed recipient, uint256 amount);
    event PrizePending(uint256 indexed tokenId, address indexed recipient, uint256 amount);
    event FundsAdded(address indexed sender, uint256 amount);
    event FundsWithdrawn(address indexed recipient, uint256 amount);
    event OracleAddressUpdated(address indexed previousOracle, address indexed newOracle);

    address private immutable _owner;
    uint256 private _nextTokenId = 1;
    address private _oracleAddress;

    mapping(uint256 => TicketData) private _tickets;
    mapping(uint256 => uint256) private _pendingRequests;

    modifier onlyOwner() {
        require(msg.sender == _owner, "Not contract owner");
        _;
    }

    constructor()
        MinimalERC721("Zama Lottery", "ZLOT", "https://zama-lottery.example/api/tickets/")
    {
        _owner = msg.sender;
        _oracleAddress = SepoliaZamaOracleAddress;
    }

    receive() external payable {
        emit FundsAdded(msg.sender, msg.value);
    }

    function owner() external view returns (address) {
        return _owner;
    }

    function oracleAddress() external view returns (address) {
        return _oracleAddress;
    }

    function buyTicket() external payable returns (uint256 tokenId) {
        require(msg.value == TICKET_PRICE, "Incorrect payment");

        tokenId = _nextTokenId;
        _nextTokenId = tokenId + 1;

        _mint(msg.sender, tokenId);

        uint32 secretNumber = _generateSecretNumber(tokenId, msg.sender);
        euint32 encryptedNumber = FHE.asEuint32(secretNumber);
        FHE.allowThis(encryptedNumber);

        TicketData storage ticket = _tickets[tokenId];
        ticket.encryptedNumber = encryptedNumber;
        ticket.revealedNumber = 0;
        ticket.requestId = 0;
        ticket.scratchRequested = false;
        ticket.isRevealed = false;
        ticket.isWinner = false;
        ticket.prizeClaimed = false;
        ticket.prizePending = false;

        emit TicketPurchased(msg.sender, tokenId, encryptedNumber);
    }

    function scratchTicket(uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");

        TicketData storage ticket = _tickets[tokenId];
        require(!_pendingExists(ticket.requestId), "Decryption pending");
        require(!ticket.isRevealed, "Ticket already revealed");
        require(!ticket.scratchRequested, "Scratch already requested");

        ticket.scratchRequested = true;

        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(ticket.encryptedNumber);

        uint256 requestId = FHE.requestDecryption(handles, this.fulfillScratch.selector);
        ticket.requestId = requestId;
        _pendingRequests[requestId] = tokenId;

        emit ScratchRequested(tokenId, requestId);
    }

    function fulfillScratch(uint256 requestId, bytes calldata cleartexts, bytes calldata decryptionProof) external {
        require(msg.sender == _oracleAddress, "Invalid caller");

        uint256 tokenId = _pendingRequests[requestId];
        require(tokenId != 0, "Unknown request");

        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        delete _pendingRequests[requestId];

        TicketData storage ticket = _tickets[tokenId];

        uint256 revealed = abi.decode(cleartexts, (uint256));
        uint32 revealedNumber = uint32(revealed % MAX_NUMBER);
        ticket.revealedNumber = revealedNumber;
        ticket.isRevealed = true;

        bool winner = _isWinningNumber(revealedNumber);
        ticket.isWinner = winner;

        address ticketOwner = ownerOf(tokenId);
        FHE.allow(ticket.encryptedNumber, ticketOwner);

        if (winner) {
            _handlePrize(tokenId, ticketOwner);
        }

        emit TicketRevealed(tokenId, revealedNumber, winner);
    }

    function claimPrize(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");

        TicketData storage ticket = _tickets[tokenId];
        require(ticket.isWinner, "Not a winning ticket");
        require(!ticket.prizeClaimed, "Prize already claimed");
        require(ticket.isRevealed, "Ticket not revealed");

        _handlePrize(tokenId, msg.sender);
    }

    function getTicket(uint256 tokenId) external view returns (TicketView memory) {
        require(_exists(tokenId), "Invalid tokenId");
        TicketData storage ticket = _tickets[tokenId];
        return TicketView({
            encryptedNumber: ticket.encryptedNumber,
            revealedNumber: ticket.revealedNumber,
            requestId: ticket.requestId,
            scratchRequested: ticket.scratchRequested,
            isRevealed: ticket.isRevealed,
            isWinner: ticket.isWinner,
            prizeClaimed: ticket.prizeClaimed,
            prizePending: ticket.prizePending
        });
    }

    function pendingTokenForRequest(uint256 requestId) external view returns (uint256) {
        return _pendingRequests[requestId];
    }

    function ticketNumbers(address account) external view returns (uint256[] memory) {
        return tokensOfOwner(account);
    }

    function withdraw(address payable recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Zero recipient");
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Withdrawal failed");
        emit FundsWithdrawn(recipient, amount);
    }

    function updateOracleAddress(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Zero oracle");
        address previous = _oracleAddress;
        _oracleAddress = newOracle;
        emit OracleAddressUpdated(previous, newOracle);
    }

    function ticketInfo(uint256 tokenId)
        external
        view
        returns (euint32 encryptedNumber, uint32 revealedNumber, bool isWinner, bool prizeClaimed)
    {
        require(_exists(tokenId), "Invalid tokenId");
        TicketData storage ticket = _tickets[tokenId];
        return (ticket.encryptedNumber, ticket.revealedNumber, ticket.isWinner, ticket.prizeClaimed);
    }

    function _handlePrize(uint256 tokenId, address recipient) private {
        TicketData storage ticket = _tickets[tokenId];

        if (ticket.prizeClaimed) {
            return;
        }

        if (address(this).balance >= PRIZE_AMOUNT) {
            ticket.prizeClaimed = true;
            ticket.prizePending = false;
            (bool sent, ) = payable(recipient).call{value: PRIZE_AMOUNT}("");
            require(sent, "Prize transfer failed");
            emit PrizePaid(tokenId, recipient, PRIZE_AMOUNT);
        } else {
            ticket.prizePending = true;
            emit PrizePending(tokenId, recipient, PRIZE_AMOUNT);
        }
    }

    function _generateSecretNumber(uint256 tokenId, address buyer) private view returns (uint32) {
        uint256 randomSource = uint256(
            keccak256(
                abi.encodePacked(block.prevrandao, blockhash(block.number - 1), buyer, tokenId, address(this))
            )
        );
        return uint32(randomSource % MAX_NUMBER);
    }

    function _pendingExists(uint256 requestId) private view returns (bool) {
        if (requestId == 0) {
            return false;
        }
        return _pendingRequests[requestId] != 0;
    }

    function _isWinningNumber(uint32 number) private pure returns (bool) {
        uint32 thousands = number / 1000;
        uint32 hundreds = (number / 100) % 10;
        uint32 tens = (number / 10) % 10;
        uint32 units = number % 10;
        return thousands == hundreds && hundreds == tens && tens == units;
    }
}
