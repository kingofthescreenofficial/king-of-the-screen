// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title King of the Screen ($KING)
 * @dev Official utility and mining token for the world's most contested $1,000,000 digital billboard.
 * Hard-capped total supply of 1,000,000,000 tokens. 100% minable by the 25 Genesis Kings.
 */
contract KingToken {
    string public constant name = "King of the Screen";
    string public constant symbol = "KING";
    uint8 public constant decimals = 18;
    uint256 public constant totalSupply = 1_000_000_000 * 10**18;

    address public owner;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _treasury) {
        owner = msg.sender;
        address initialHolder = _treasury != address(0) ? _treasury : msg.sender;
        balanceOf[initialHolder] = totalSupply;
        emit Transfer(address(0), initialHolder, totalSupply);
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
        require(balanceOf[sender] >= amount, "Insufficient balance");
        require(allowance[sender][msg.sender] >= amount, "Allowance exceeded");
        balanceOf[sender] -= amount;
        allowance[sender][msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }
}
