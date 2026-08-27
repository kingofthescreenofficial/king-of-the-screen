// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title King of the Screen ($KING) - Ultra-Gas-Optimized
 * Hard-capped 1,000,000,000 supply minted to deployer in constructor.
 * Fits within minimal deployment gas (<200k gas / <$0.15).
 */
contract KingToken {
    string public constant name = "King of the Screen";
    string public constant symbol = "KING";
    uint8 public constant decimals = 18;
    uint256 public constant totalSupply = 1_000_000_000 * 1e18;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Low balance");
        unchecked {
            balanceOf[msg.sender] -= amount;
            balanceOf[to] += amount;
        }
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Low balance");
        require(allowance[from][msg.sender] >= amount, "Low allowance");
        unchecked {
            balanceOf[from] -= amount;
            allowance[from][msg.sender] -= amount;
            balanceOf[to] += amount;
        }
        emit Transfer(from, to, amount);
        return true;
    }
}
