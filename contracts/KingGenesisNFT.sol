// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title King of the Screen 1-of-25 Genesis NFT Relics
 * @dev Ultra-exclusive digital crown relics awarded to the 25 Genesis Kings who rule the screen.
 * Strictly limited to exactly 25 on-chain tokens in history.
 */
contract KingGenesisNFT {
    string public constant name = "King of the Screen Genesis Relics";
    string public constant symbol = "KINGNFT";
    uint256 public constant MAX_SUPPLY = 25;

    address public owner;
    uint256 public totalMinted;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event MonarchCrowned(uint256 indexed tokenId, address indexed king, string uri);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function mintGenesisRelic(address king, string calldata uri) external onlyOwner returns (uint256) {
        require(totalMinted < MAX_SUPPLY, "All 25 Genesis Relics have been claimed");
        require(king != address(0), "Invalid king address");

        totalMinted++;
        uint256 newTokenId = totalMinted;

        ownerOf[newTokenId] = king;
        balanceOf[king]++;
        _tokenURIs[newTokenId] = uri;

        emit Transfer(address(0), king, newTokenId);
        emit MonarchCrowned(newTokenId, king, uri);

        return newTokenId;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }

    function approve(address to, uint256 tokenId) external {
        address tokenOwner = ownerOf[tokenId];
        require(msg.sender == tokenOwner || isApprovedForAll[tokenOwner][msg.sender], "Not authorized");
        getApproved[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        address tokenOwner = ownerOf[tokenId];
        require(tokenOwner == from, "Wrong from address");
        require(to != address(0), "Invalid recipient");
        require(
            msg.sender == tokenOwner ||
            getApproved[tokenId] == msg.sender ||
            isApprovedForAll[tokenOwner][msg.sender],
            "Not authorized"
        );

        balanceOf[from]--;
        balanceOf[to]++;
        ownerOf[tokenId] = to;
        delete getApproved[tokenId];

        emit Transfer(from, to, tokenId);
    }
}
