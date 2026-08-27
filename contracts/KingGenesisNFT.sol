// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title King of the Screen 1-of-25 Genesis NFT Relics - Ultra-Compact (<400k gas)
 * Hard-capped at 25 tokens. Standard ERC-721 / OpenSea compliant.
 */
contract KingGenesisNFT {
    string public constant name = "King of the Screen Genesis Relics";
    string public constant symbol = "KINGNFT";
    uint256 public constant MAX_SUPPLY = 25;

    address public immutable owner;
    uint256 public totalMinted;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    constructor() {
        owner = msg.sender;
    }

    function mintGenesisRelic(address king, string calldata uri) external returns (uint256) {
        require(msg.sender == owner, "Only owner");
        require(totalMinted < MAX_SUPPLY, "Capped 25");

        unchecked {
            totalMinted++;
        }
        uint256 tid = totalMinted;

        ownerOf[tid] = king;
        balanceOf[king]++;
        _tokenURIs[tid] = uri;

        emit Transfer(address(0), king, tid);
        return tid;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "No token");
        return _tokenURIs[tokenId];
    }

    function approve(address to, uint256 tokenId) external {
        address o = ownerOf[tokenId];
        require(msg.sender == o || isApprovedForAll[o][msg.sender], "Not auth");
        getApproved[tokenId] = to;
        emit Approval(o, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        address o = ownerOf[tokenId];
        require(o == from && to != address(0), "Invalid");
        require(msg.sender == o || getApproved[tokenId] == msg.sender || isApprovedForAll[o][msg.sender], "Not auth");

        balanceOf[from]--;
        balanceOf[to]++;
        ownerOf[tokenId] = to;
        delete getApproved[tokenId];

        emit Transfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x01ffc9a7 || interfaceId == 0x80ac58cd || interfaceId == 0x5b5e139f;
    }
}
