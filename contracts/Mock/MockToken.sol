// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockToken is ERC20, Ownable {
    bool public transferShouldFail;

    constructor(address initialOwner) ERC20("MockToken", "MTK") {
        _transferOwnership(initialOwner);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    function setTransferShouldFail(bool shouldFail) external onlyOwner {
        transferShouldFail = shouldFail;
    } // hàm setTransferShouldFail được sử dụng để đặt trạng thái của biến transferShouldFail, cho phép chủ sở hữu hợp đồng quyết định xem việc chuyển token có nên thất bại hay không. Điều này có thể hữu ích trong các tình huống kiểm tra hoặc mô phỏng hành vi của hợp đồng khi chuyển token.
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        require(!transferShouldFail, "Token transfer failed");
        return super.transferFrom(sender, recipient, amount);
    }
}
