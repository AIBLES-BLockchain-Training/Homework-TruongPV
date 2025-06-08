import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("LendingPool", function () {
  async function setup() {
    const [admin, user1, user2] = await ethers.getSigners();

    const MockLendingPoolFactory = await ethers.getContractFactory(
      "MockLendingPool"
    );
    const mockLendingPool = await MockLendingPoolFactory.deploy();

    const LendingPool = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPool.deploy();

    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy(admin.address);
    await mockToken.waitForDeployment();
    const initialSupply = ethers.parseUnits("1000", 18);
    await mockToken.connect(admin).mint(admin.address, initialSupply);
    await mockToken.connect(admin).mint(user1.address, initialSupply);
    await mockToken.connect(admin).mint(user2.address, initialSupply);

    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy();

    const collateramanager = await ethers.getContractFactory(
      "CollateralManager"
    );
    const collateralManager = await collateramanager.deploy();

    const InterestRate = await ethers.getContractFactory("InterestRate");
    const interestRate = await InterestRate.deploy();

    const BorrowerFactory = await ethers.getContractFactory("Borrower");
    const borrower = await BorrowerFactory.deploy();
    await borrower.setContractAddress(
      lendingPool.getAddress(),
      collateralManager.getAddress(),
      interestRate.getAddress(),
      priceOracle.getAddress()
    );

    await interestRate.setContractAddress(
      lendingPool.getAddress(),
      borrower.getAddress()
    );
    await lendingPool.setContractAddress(
      await priceOracle.getAddress(),
      await collateralManager.getAddress(),
      await interestRate.getAddress(),
      await borrower.getAddress(),
      {}
    );
    return {
      admin,
      user1,
      user2,
      lendingPool,
      mockToken,
      priceOracle,
      collateralManager,
      interestRate,
      borrower,
      mockLendingPool,
    };
  }
  /////////////////////////setContractAddress/////////////////////////
  /////////////////////////setContractAddress/////////////////////////
  it("Should set contract addresses when called by admin", async function () {
    const {
      admin,
      lendingPool,
      priceOracle,
      collateralManager,
      interestRate,
      borrower,
    } = await loadFixture(setup);
    await lendingPool
      .connect(admin)
      .setContractAddress(
        await priceOracle.getAddress(),
        await collateralManager.getAddress(),
        await interestRate.getAddress(),
        await borrower.getAddress()
      );
    expect(await lendingPool.priceOracle()).to.equal(
      await priceOracle.getAddress()
    );
    expect(await lendingPool.collateralManager()).to.equal(
      await collateralManager.getAddress()
    );
    expect(await lendingPool.interestRate()).to.equal(
      await interestRate.getAddress()
    );
    expect(await lendingPool.borrower()).to.equal(await borrower.getAddress());
  });
  it("Should revert if not called by admin", async function () {
    const {
      user1,
      lendingPool,
      priceOracle,
      collateralManager,
      interestRate,
      borrower,
    } = await loadFixture(setup);
    await expect(
      lendingPool
        .connect(user1)
        .setContractAddress(
          await priceOracle.getAddress(),
          await collateralManager.getAddress(),
          await interestRate.getAddress(),
          await borrower.getAddress()
        )
    ).to.be.revertedWith("only admin");
  });
  /////////////////////////setFee/////////////////////////
  /////////////////////////setFee/////////////////////////
  it("Should set fee when called by admin", async function () {
    const { admin, lendingPool } = await loadFixture(setup);
    await lendingPool.connect(admin).setFee(100);
    expect(await lendingPool.fee()).to.equal(100);
  });
  it("Should revert if not called by admin", async function () {
    const { user1, lendingPool } = await loadFixture(setup);
    await expect(lendingPool.connect(user1).setFee(100)).to.be.revertedWith(
      "only admin"
    );
  });
  /////////////////////////getAllValidCollateral/////////////////////////
  /////////////////////////getAllValidCollateral/////////////////////////
  it("Should return all valid collateral", async function () {
    const { admin, collateralManager, mockToken, lendingPool, user1 } =
      await loadFixture(setup);

    // Submit and approve collateral request
    await collateralManager
      .connect(admin)
      .submitCollateralRequest(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .approveCollateralRequest(mockToken.getAddress());

    // Tạo số lượng token và cấp phép
    const amount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);

    // Thêm collateral
    await collateralManager
      .connect(user1)
      .addCollateral(mockToken.getAddress(), amount);

    // Kiểm tra các token collateral hợp lệ
    const validCollateral = await lendingPool.getAllValidCollateralTokens();
    console.log("Valid Collateral Tokens:", validCollateral); // In ra danh sách collateral hợp lệ

    // Chờ giá trị trả về từ mockToken.getAddress()
    const mockTokenAddress = await mockToken.getAddress();

    // Kiểm tra rằng mockToken có trong danh sách validCollateral
    expect(validCollateral).to.include(mockTokenAddress); // So sánh đúng giá trị đồng bộ
  });
  /////////////////////////isApprovedCollateral/////////////////////////
  /////////////////////////isApprovedCollateral/////////////////////////
  it("Should return true if collateral is approved", async function () {
    const { admin, collateralManager, mockToken, lendingPool } =
      await loadFixture(setup);

    // Submit and approve collateral request
    await collateralManager
      .connect(admin)
      .submitCollateralRequest(mockToken.getAddress());
    await collateralManager
      .connect(admin)
      .approveCollateralRequest(mockToken.getAddress());

    // Kiểm tra xem collateral đã được phê duyệt chưa
    const isApproved = await lendingPool.isApprovedCollateral(
      mockToken.getAddress()
    );
    expect(isApproved).to.be.true;
  });
  /////////////////////////deposit/////////////////////////
  /////////////////////////deposit/////////////////////////
  it("Should deposit assets correctly", async function () {
    const {
      lendingPool,
      collateralManager,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await loadFixture(setup);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await lendingPool.connect(admin).setFee(serviceFee);

    await collateralManager
      .connect(admin)
      .submitCollateralRequest(mockToken.getAddress());
    await collateralManager
      .connect(admin)
      .approveCollateralRequest(mockToken.getAddress());

    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());
    const [liquidityIndexRetrieved] = await interestRate.getReserveData(
      mockToken.getAddress()
    );

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .deposit(mockToken.getAddress(), depositAmount, { value: serviceFee });
    const lenderAsset = await lendingPool.lenderAssets(
      user1.address,
      mockToken.getAddress()
    );
    expect(lenderAsset.amount).to.equal(depositAmount);
    expect(lenderAsset.liquityIndex).to.equal(liquidityIndexRetrieved);

    const assetBalance = await lendingPool.assetBalance(mockToken.getAddress());
    expect(assetBalance).to.equal(depositAmount);

    const totalSupplied = await lendingPool.totalassetSupplied(
      mockToken.getAddress()
    );
    expect(totalSupplied).to.equal(depositAmount);
  });
  it("The amount must be greater than zero ", async function () {
    const { lendingPool, mockToken, user1 } = await loadFixture(setup);
    const depositAmount = ethers.parseUnits("0", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await expect(
      lendingPool.deposit(mockToken.getAddress(), depositAmount, {
        value: 0,
      })
    ).to.be.revertedWith("The amount must be greater than zero");
  });
  it("Token is not allowed for deposit", async function () {
    const { lendingPool, mockToken, user1 } = await loadFixture(setup);
    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await expect(
      lendingPool.deposit(mockToken.getAddress(), depositAmount, {
        value: 0,
      })
    ).to.be.revertedWith("Token is not allowed for deposit");
  });
  it("Incorrect service fee amount ", async function () {
    const { lendingPool, mockToken, user1, admin, collateralManager } =
      await loadFixture(setup);
    const depositAmount = ethers.parseUnits("100", 18);
    await lendingPool.connect(admin).setFee(depositAmount);

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await expect(
      lendingPool.deposit(mockToken.getAddress(), depositAmount, {
        value: 0,
      })
    ).to.be.revertedWith("Token is not allowed for deposit");
  });
  it("Should adjust existing lender asset when depositing again ", async function () {
    const {
      lendingPool,
      collateralManager,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await loadFixture(setup);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await lendingPool.connect(admin).setFee(serviceFee);

    await collateralManager
      .connect(admin)
      .submitCollateralRequest(mockToken.getAddress());
    await collateralManager

      .connect(admin)
      .approveCollateralRequest(mockToken.getAddress());
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());
    const [liquidityIndexRetrieved] = await interestRate.getReserveData(
      mockToken.getAddress()
    );
    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool

      .connect(user1)
      .deposit(mockToken.getAddress(), depositAmount, { value: serviceFee });
    const lenderAsset = await lendingPool.lenderAssets(
      user1.address,
      mockToken.getAddress()
    );
    expect(lenderAsset.amount).to.equal(depositAmount);
    expect(lenderAsset.liquityIndex).to.equal(liquidityIndexRetrieved);
    const assetBalance = await lendingPool.assetBalance(mockToken.getAddress());
    expect(assetBalance).to.equal(depositAmount);
    const totalSupplied = await lendingPool.totalassetSupplied(
      mockToken.getAddress()
    );
    expect(totalSupplied).to.equal(depositAmount);

    const depositAmount2 = ethers.parseUnits("50", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount2);

    await lendingPool

      .connect(user1)
      .deposit(mockToken.getAddress(), depositAmount2, { value: serviceFee });
    const lenderAsset2 = await lendingPool.lenderAssets(
      user1.address,
      mockToken.getAddress()
    );
    expect(lenderAsset2.amount).to.equal(depositAmount + depositAmount2);
    expect(lenderAsset2.liquityIndex).to.equal(liquidityIndexRetrieved);
    const assetBalance2 = await lendingPool.assetBalance(
      mockToken.getAddress()
    );
    expect(assetBalance2).to.equal(depositAmount + depositAmount2);
    const totalSupplied2 = await lendingPool.totalassetSupplied(
      mockToken.getAddress()
    );
    expect(totalSupplied2).to.equal(depositAmount + depositAmount2);
  });
  it("Should revert if incorrect service fee is sent ", async function () {
    const { lendingPool, mockToken, user1, admin, collateralManager } =
      await loadFixture(setup);
    const depositAmount = ethers.parseUnits("100", 18);
    await lendingPool.connect(admin).setFee(depositAmount);

    await collateralManager
      .connect(admin)
      .submitCollateralRequest(mockToken.getAddress());
    await collateralManager
      .connect(admin)
      .approveCollateralRequest(mockToken.getAddress());

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await expect(
      lendingPool.deposit(mockToken.getAddress(), depositAmount, {
        value: 0,
      })
    ).to.be.revertedWith("Incorrect service fee amount");
  });

  /////////////////////////totalSupplied/////////////////////////
  /////////////////////////totalSupplied/////////////////////////
  it("Should return total supplied assets", async function () {
    const { lendingPool, collateralManager, mockToken, user1, admin } =
      await loadFixture(setup);

    const depositAmount = ethers.parseUnits("100", 18);
    await collateralManager
      .connect(admin)
      .submitCollateralRequest(mockToken.getAddress());
    await collateralManager
      .connect(admin)
      .approveCollateralRequest(mockToken.getAddress());
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .deposit(mockToken.getAddress(), depositAmount, { value: 0 });

    const totalSupplied = await lendingPool.totalassetSupplied(
      mockToken.getAddress()
    );
    expect(totalSupplied).to.equal(depositAmount);
  });
  //////////////////////////////////withdraw/////////////////////////
  //////////////////////////////////withdraw/////////////////////////
  it("Should withdraw assets correctly", async function () {
    const {
      lendingPool,
      collateralManager,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await loadFixture(setup);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await lendingPool.connect(admin).setFee(serviceFee);

    // Approve token as collateral
    await collateralManager
      .connect(admin)
      .submitCollateralRequest(mockToken.getAddress());
    await collateralManager
      .connect(admin)
      .approveCollateralRequest(mockToken.getAddress());

    // Initialize reserve in interest rate contract
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    const [liquidityIndexRetrieved] = await interestRate.getReserveData(
      mockToken.getAddress()
    );

    const depositAmount = ethers.parseUnits("100", 18);

    // Approve token transfer
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    // Deposit tokens into the pool
    await lendingPool
      .connect(user1)
      .deposit(mockToken.getAddress(), depositAmount, { value: serviceFee });

    const lenderAsset = await lendingPool.lenderAssets(
      user1.address,
      mockToken.getAddress()
    );
    expect(lenderAsset.amount).to.equal(depositAmount);
    expect(lenderAsset.liquityIndex).to.equal(liquidityIndexRetrieved);

    const withdrawAmount = ethers.parseUnits("50", 18);

    await lendingPool
      .connect(user1)
      .withdraw(mockToken.getAddress(), withdrawAmount, { value: serviceFee });

    const lenderAssetAfterWithdraw = await lendingPool.lenderAssets(
      user1.address,
      mockToken.getAddress()
    );
    expect(lenderAssetAfterWithdraw.amount).to.equal(
      depositAmount - withdrawAmount
    );
  });
  it("should revert if the amount must be greater than 0 ", async function () {
    const { lendingPool, mockToken, user1 } = await loadFixture(setup);
    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await expect(
      lendingPool.withdraw(mockToken.getAddress(), 0, { value: 0 })
    ).to.be.revertedWith("amount must be greater than 0");
  });
  it("should revert if the asset is not approved as collateral  ", async function () {
    const { lendingPool, mockToken, user1 } = await loadFixture(setup);
    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await expect(
      lendingPool.withdraw(mockToken.getAddress(), depositAmount, {
        value: 0,
      })
    ).to.be.revertedWith("asset is not approved as collateral");
  });
  it("should revert if the send the correct amount of the fee set  ", async function () {
    const { lendingPool, mockToken, user1, admin, collateralManager } =
      await loadFixture(setup);
    const depositAmount = ethers.parseUnits("100", 18);
    await lendingPool.connect(admin).setFee(depositAmount);

    await collateralManager
      .connect(admin)
      .submitCollateralRequest(mockToken.getAddress());
    await collateralManager
      .connect(admin)
      .approveCollateralRequest(mockToken.getAddress());

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await expect(
      lendingPool.withdraw(mockToken.getAddress(), depositAmount, {
        value: 0,
      })
    ).to.be.revertedWith("send the correct amount of the fee set");
  });

  ////////////////////////////////transferLoan////////////////////////
  ////////////////////////////////transferLoan////////////////////////
  // it("should transfer loan successfully when conditions are met", async function () {
  //   const {
  //     lendingPool,
  //     collateralManager,
  //     mockToken,
  //     admin,
  //     user1,
  //     user2,
  //     interestRate,
  //   } = await loadFixture(setup);

  //   const depositAmount = ethers.parseUnits("100", 18);
  //   const transferAmount = ethers.parseUnits("50", 18);
  //   const serviceFee = ethers.parseUnits("0.01", 18);

  //   // Set service fee in the lending pool contract
  //   await lendingPool.connect(admin).setFee(serviceFee);

  //   // Approve token as collateral
  //   await collateralManager
  //     .connect(admin)
  //     .submitCollateralRequest(mockToken.getAddress());
  //   await collateralManager
  //     .connect(admin)
  //     .approveCollateralRequest(mockToken.getAddress());

  //   // Initialize reserve in interest rate contract
  //   await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

  //   // Deposit tokens into the lending pool
  //   await mockToken
  //     .connect(user1)
  //     .approve(lendingPool.getAddress(), depositAmount);
  //   await lendingPool
  //     .connect(user1)
  //     .deposit(mockToken.getAddress(), depositAmount, { value: serviceFee });

  //   // Check initial balances
  //   const initialSenderBalance = await lendingPool.lenderAssets(
  //     user1.address,
  //     mockToken.getAddress()
  //   );
  //   const initialReceiverBalance = await lendingPool.lenderAssets(
  //     user2.address,
  //     mockToken.getAddress()
  //   );

  //   expect(initialSenderBalance.amount).to.equal(depositAmount);
  //   expect(initialReceiverBalance.amount).to.equal(0);

  //   // Transfer loan successfully
  //   await lendingPool
  //     .connect(user1)
  //     .transferLoan(mockToken.getAddress(), user2.address, transferAmount);

  //   // Check balances after transfer
  //   const senderBalanceAfter = await lendingPool.lenderAssets(
  //     user1.address,
  //     mockToken.getAddress()
  //   );
  //   const receiverBalanceAfter = await lendingPool.lenderAssets(
  //     user2.address,
  //     mockToken.getAddress()
  //   );

  //   expect(senderBalanceAfter.amount).to.equal(depositAmount - transferAmount);
  //   expect(receiverBalanceAfter.amount).to.equal(transferAmount);
  // });
  it("should revert if the asset is not approved as collateral ", async function () {
    const { lendingPool, mockToken, user1, user2 } = await loadFixture(setup);
    const depositAmount = ethers.parseUnits("100", 18);
    const transferAmount = ethers.parseUnits("50", 18);

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await expect(
      lendingPool
        .connect(user1)
        .transferLoan(mockToken.getAddress(), user2.address, transferAmount)
    ).to.be.revertedWith("asset is not approved as collateral");
  });
  it("should revert if the not enough balance to transfer ", async function () {
    const { lendingPool, mockToken, user1, user2, admin, collateralManager } =
      await loadFixture(setup);
    const depositAmount = ethers.parseUnits("100", 18);
    const transferAmount = ethers.parseUnits("150", 18);
    const serviceFee = ethers.parseUnits("0.01", 18);

    // Set service fee in the lending pool contract
    await lendingPool.connect(admin).setFee(serviceFee);

    // Approve token as collateral
    await collateralManager
      .connect(admin)
      .submitCollateralRequest(mockToken.getAddress());
    await collateralManager
      .connect(admin)
      .approveCollateralRequest(mockToken.getAddress());

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await expect(
      lendingPool
        .connect(user1)
        .transferLoan(mockToken.getAddress(), user2.address, transferAmount)
    ).to.be.revertedWith("not enough balance");
  });

  ////////////////////////////withdrawServiceFee//////////////////////
  ////////////////////////////withdrawServiceFee//////////////////////
  it("Should revert if non-admin tries to withdraw", async function () {
    const { user1, lendingPool } = await loadFixture(setup);

    const withdrawAmount = ethers.parseUnits("0.1", "ether");
    await expect(
      lendingPool.connect(user1).withdrawServiceFee(withdrawAmount)
    ).to.be.revertedWith("only admin");
  });
  it("Should revert if withdraw amount exceeds service fee balance", async function () {
    const { admin, lendingPool } = await loadFixture(setup);

    const depositAmount = ethers.parseUnits("0.2", "ether");
    await admin.sendTransaction({
      to: lendingPool.getAddress(),
      value: depositAmount,
    });

    const withdrawAmount = ethers.parseUnits("1", "ether"); // vượt quá balance

    await expect(
      lendingPool.connect(admin).withdrawServiceFee(withdrawAmount)
    ).to.be.revertedWith("Insufficient service fee balance");
  });
  it("Should allow withdrawing full service fee balance", async function () {
    const { admin, lendingPool } = await loadFixture(setup);

    const depositAmount = ethers.parseUnits("1", "ether");
    await admin.sendTransaction({
      to: lendingPool.getAddress(),
      value: depositAmount,
    });

    const initialBalance = await ethers.provider.getBalance(admin.address);

    const tx = await lendingPool
      .connect(admin)
      .withdrawServiceFee(depositAmount);
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error("Transaction receipt is null");
    }
    const gasUsed = receipt.gasUsed * tx.gasPrice!;

    const finalBalance = await ethers.provider.getBalance(admin.address);
    expect(finalBalance).to.equal(initialBalance + depositAmount - gasUsed);

    const contractBalance = await ethers.provider.getBalance(
      lendingPool.getAddress()
    );
    expect(contractBalance).to.equal(0);
  });
  it("Should allow withdrawing 0 ETH without changing balances", async function () {
    const { admin, lendingPool } = await loadFixture(setup);

    const initialAdminBalance = await ethers.provider.getBalance(admin.address);
    const initialContractBalance = await ethers.provider.getBalance(
      lendingPool.getAddress()
    );

    const tx = await lendingPool.connect(admin).withdrawServiceFee(0);
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error("Transaction receipt is null");
    }
    const gasUsed = receipt.gasUsed * tx.gasPrice!;

    const finalAdminBalance = await ethers.provider.getBalance(admin.address);
    const finalContractBalance = await ethers.provider.getBalance(
      lendingPool.getAddress()
    );

    expect(finalAdminBalance).to.equal(initialAdminBalance - gasUsed);
    expect(finalContractBalance).to.equal(initialContractBalance);
  });
  ///////////////////////////totalSupplied////////////////////
  ///////////////////////////totalSupplied////////////////////
  it("Should return 0 if no asset has been supplied yet", async function () {
    const { lendingPool, mockToken } = await loadFixture(setup);
    const result = await lendingPool.totalSupplied(mockToken.getAddress());
    expect(result).to.equal(0);
  });
  /////////////////////////getTotalBalance////////////////////////
  /////////////////////////getTotalBalance////////////////////////
  it("Should return correct total balance and liquidity index", async function () {
    const {
      lendingPool,
      collateralManager,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await loadFixture(setup);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await lendingPool.connect(admin).setFee(serviceFee);

    // Approve token as collateral
    await collateralManager
      .connect(admin)
      .submitCollateralRequest(mockToken.getAddress());
    await collateralManager
      .connect(admin)
      .approveCollateralRequest(mockToken.getAddress());

    // Initialize reserve in interest rate contract
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    // Get the initial liquidity index
    const [liquidityIndexRetrieved] = await interestRate.getReserveData(
      mockToken.getAddress()
    );

    const depositAmount = ethers.parseUnits("100", 18);

    // Approve token transfer by user1
    await mockToken
      .connect(user1)
      .approve(await lendingPool.getAddress(), depositAmount);

    // Deposit tokens from user1
    await lendingPool
      .connect(user1)
      .deposit(mockToken.getAddress(), depositAmount, { value: serviceFee });

    // Call getTotalBalance as user1 (correct address that deposited)
    const [totalBalance, liquidityIndex] = await lendingPool
      .connect(user1)
      .getTotalBalance(mockToken.getAddress());

    // Validate results
    expect(totalBalance).to.equal(depositAmount);
    expect(liquidityIndex).to.equal(liquidityIndexRetrieved);
  });
  it("Should revert if a non-authorized contract tries to transfer", async function () {
    const {
      lendingPool,
      borrower,
      mockToken,
      collateralManager,
      interestRate,
      admin,
      user1,
    } = await loadFixture(setup);

    await expect(
      lendingPool
        .connect(user1)
        .transferExcessAmount(mockToken.getAddress(), user1.address, 1000)
    ).to.be.revertedWith("only authorized contracts");
  });
});
