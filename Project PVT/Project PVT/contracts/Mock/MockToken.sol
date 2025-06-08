// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockToken is ERC20, Ownable {
    event Mint(address indexed to, uint256 amount);

    constructor(
        address initialOwner
    ) ERC20("MockToken", "Pham Van Truong") Ownable(initialOwner) {}

    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "ERC20: mint to the zero address");
        require(amount > 0, "Amount must be greater than zero");
        _mint(to, amount);
        emit Mint(to, amount);
    }
}
