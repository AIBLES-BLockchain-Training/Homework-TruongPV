// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserManagement {
    enum Role { Administrator, Manager, RegularUser }

    mapping(address => Role) public roles;

    modifier onlyRole(Role role) {
        require(roles[msg.sender] == role, "Unauthorized");
        _;
    }

    function assignRole(address user, Role role) external onlyRole(Role.Administrator) {
        roles[user] = role;
    }
}

contract FinancialOperations is UserManagement {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        require(roles[msg.sender] == Role.RegularUser, "Only regular users can deposit");
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(roles[msg.sender] == Role.RegularUser, "Only regular users can withdraw");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        payable(msg.sender).transfer(amount);
        balances[msg.sender] -= amount;
    }
}

contract LoanSystem is FinancialOperations {
    struct Loan {
        uint256 principal; 
        uint256 interestRate; 
        uint256 repaymentAmount; 
        bool approved;
    }

    mapping(address => Loan) public loans;

    function requestLoan(uint256 principal, uint256 interestRate) external {
        require(roles[msg.sender] == Role.RegularUser, "Only regular users can request loans");
        loans[msg.sender] = Loan(principal, interestRate, calculateRepaymentAmount(principal, interestRate), false);
    }
    function approveLoan(address borrower) external onlyRole(Role.Manager) {
        Loan storage loan = loans[borrower];
        require(loan.principal > 0, "No loan requested");
        loan.approved = true;
        balances[borrower] += loan.principal;
    }
    function repayLoan() external payable {
        require(roles[msg.sender] == Role.RegularUser, "Only regular users can repay loans");
        Loan storage loan = loans[msg.sender];
        require(loan.approved, "Loan not approved or does not exist");
        require(msg.value >= loan.repaymentAmount, "Insufficient repayment amount");

        // Handle overpayment
        uint256 overpayment = msg.value - loan.repaymentAmount;
        if (overpayment > 0) {
            payable(msg.sender).transfer(overpayment);
        }
        delete loans[msg.sender];
    }
    function calculateRepaymentAmount(uint256 principal, uint256 interestRate) internal pure returns (uint256) {
        return principal + (principal * interestRate / 100);
    }
}
