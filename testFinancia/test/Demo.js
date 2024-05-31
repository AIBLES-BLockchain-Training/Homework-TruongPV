const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserManagement", function() {
    async function setup() {
        const [owner, user1, user2] = await ethers.getSigners();
        const UserManagement = await ethers.getContractFactory("UserManagement");
        const userManagement = await UserManagement.deploy();
        return { userManagement, owner, user1, user2 };
    }

    describe("Deployment", function() {
        it("Should set the correct role for the owner", async function() {
            const { userManagement, owner } = await loadFixture(setup);
            expect(await userManagement.roles(owner.address)).to.equal(0); 
        });
    });

    describe("Role Assignment", function() {
        it("Should allow Administrator to assign roles", async function() {
            const { userManagement, owner, user1 } = await loadFixture(setup);
            await userManagement.assignRole(user1.address, 1); // 1 is the Role.Manager
            expect(await userManagement.roles(user1.address)).to.equal(1);
        });

        it("Should not allow RegularUser to assign roles", async function() {
            const { userManagement, user1, user2 } = await loadFixture(setup);
            await userManagement.assignRole(user1.address, 2); 
            await expect(userManagement.connect(user1).assignRole(user2.address, 1))
                .to.be.revertedWith("Unauthorized");
        });
    });
});

describe("FinancialOperations Contract", function () {
    async function setup() {
        const FinancialOperations = await ethers.getContractFactory("FinancialOperations");
        const financialOperations = await FinancialOperations.deploy();

        const [owner, regularUser, nonUser] = await ethers.getSigners();
        await financialOperations.assignRole(regularUser.address, 2); 

        return { financialOperations, owner, regularUser, nonUser };
    }

    it("Should allow regular user to deposit funds and update balance", async function () {
        const { financialOperations, regularUser } = await loadFixture(setup);
        await financialOperations.connect(regularUser).deposit({ value: 10000 });

        const userBalance = await financialOperations.balances(regularUser.address);
        expect(userBalance).to.equal(10000);
    });

    it("Should not allow non-user to deposit funds", async function () {
        const { financialOperations, nonUser } = await loadFixture(setup);
        await expect(financialOperations.connect(nonUser).deposit({ value: 10000 }))
            .to.be.revertedWith("Only regular users can deposit");
    });

    it("Should allow regular user to withdraw funds", async function () {
        const { financialOperations, regularUser } = await loadFixture(setup);
        await financialOperations.connect(regularUser).deposit({ value: 10000 });
        await financialOperations.connect(regularUser).withdraw(5000);

        const userBalance = await financialOperations.balances(regularUser.address);
        expect(userBalance).to.equal(5000);
    });

    it("Should not allow non-user to withdraw funds", async function () {
        const { financialOperations, nonUser } = await loadFixture(setup);
        await expect(financialOperations.connect(nonUser).withdraw(10000))
            .to.be.revertedWith("Only regular users can withdraw");
    });

    it("Should not allow withdrawal of amount greater than balance", async function () {
        const { financialOperations, regularUser } = await loadFixture(setup);
        await financialOperations.connect(regularUser).deposit({ value: 10000 });
        await expect(financialOperations.connect(regularUser).withdraw(20000))
            .to.be.revertedWith("Insufficient balance");
    });
});

describe("LoanSystem Contract", function () {
    async function setup() {
        const [admin, manager, user1, user2] = await ethers.getSigners();
        const LoanSystem = await ethers.getContractFactory("LoanSystem");
        const loanSystem = await LoanSystem.deploy();

        await loanSystem.connect(admin).assignRole(manager.address, 1);
        await loanSystem.connect(admin).assignRole(user1.address, 2); 
        return { loanSystem, admin, manager, user1, user2 };
    }

    it("Should allow a regular user to request a loan", async function () {
        const { loanSystem, user1 } = await loadFixture(setup);
        const principal = 10000;
        const interestRate = 10;
        await loanSystem.connect(user1).requestLoan(principal, interestRate);
        const loan = await loanSystem.loans(user1.address);
        expect(loan.principal).to.equal(principal);
        expect(loan.interestRate).to.equal(interestRate);
        expect(loan.approved).to.be.false;
    });

    it("Should allow a manager to approve a loan", async function () {
        const { loanSystem, manager, user1 } = await loadFixture(setup);
        const principal = 10000;
        const interestRate = 10;
        await loanSystem.connect(user1).requestLoan(principal, interestRate);
        await loanSystem.connect(manager).approveLoan(user1.address);
        const loan = await loanSystem.loans(user1.address);
        expect(loan.approved).to.be.true;
        expect(await loanSystem.balances(user1.address)).to.equal(principal);
    });

    it("Should allow a regular user to repay an approved loan", async function () {
        const { loanSystem, user1, manager } = await loadFixture(setup);
        const principal = 10000;
        const interestRate = 10;
        await loanSystem.connect(user1).requestLoan(principal, interestRate);
        await loanSystem.connect(manager).approveLoan(user1.address);
        const repaymentAmount = principal + (principal * interestRate / 100);
        await loanSystem.connect(user1).repayLoan({ value: repaymentAmount });

        const loan = await loanSystem.loans(user1.address);
        expect(loan.principal).to.equal(0);
        expect(loan.approved).to.be.false;
    });

    it("Should not allow non-regular user to request a loan", async function () {
        const { loanSystem, user2 } = await loadFixture(setup);
        const principal = 10000;
        const interestRate = 10;
        await expect(loanSystem.connect(user2).requestLoan(principal, interestRate))
            .to.be.revertedWith("Only regular users can request loans");
    });

    it("Should not allow non-regular user to repay a loan", async function () {
        const { loanSystem, user1, user2, manager } = await loadFixture(setup);
        const principal = 10000;
        const interestRate = 10;
        await loanSystem.connect(user1).requestLoan(principal, interestRate);
        await loanSystem.connect(manager).approveLoan(user1.address);
        const repaymentAmount = principal + (principal * interestRate / 100);
        await expect(loanSystem.connect(user2).repayLoan({ value: repaymentAmount }))
            .to.be.revertedWith("Only regular users can repay loans");
    });
});