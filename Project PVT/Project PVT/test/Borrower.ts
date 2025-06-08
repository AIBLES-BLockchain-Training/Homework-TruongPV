import { expect } from "chai";
import { ethers, network } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Borrower Contract Tests", function () {
  async function setup() {
    const [admin, user1, user2, user3] = await ethers.getSigners();

    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    const mockToken = await MockTokenFactory.deploy(admin.address);

    const initialSupply = ethers.parseUnits("1000", 18);
    await mockToken.connect(admin).mint(admin.address, initialSupply);
    await mockToken.connect(admin).mint(user1.address, initialSupply);
    await mockToken.connect(admin).mint(user2.address, initialSupply);
    await mockToken.connect(admin).mint(user3.address, initialSupply);

    const PriceOracleFactory = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracleFactory.deploy();

    const LendingPoolFactory = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPoolFactory.deploy();

    const InterestRateFactory = await ethers.getContractFactory("InterestRate");
    const interestRate = await InterestRateFactory.deploy();

    const CollateralManagerFactory = await ethers.getContractFactory(
      "CollateralManager"
    );
    const collateralManager = await CollateralManagerFactory.deploy();

    const BorrowerFactory = await ethers.getContractFactory("Borrower");
    const borrower = await BorrowerFactory.deploy();

    // Set up contract connections
    await borrower
      .connect(admin)
      .setContractAddress(
        await lendingPool.getAddress(),
        await interestRate.getAddress(),
        await priceOracle.getAddress(),
        await collateralManager.getAddress()
      );

    await collateralManager
      .connect(admin)
      .setContractAddresses(
        await priceOracle.getAddress(),
        await mockToken.getAddress(),
        await lendingPool.getAddress(),
        await borrower.getAddress(),
        await interestRate.getAddress()
      );

    await lendingPool
      .connect(admin)
      .setContractAddress(
        await priceOracle.getAddress(),
        await collateralManager.getAddress(),
        await interestRate.getAddress(),
        await borrower.getAddress()
      );

    await interestRate
      .connect(admin)
      .setContractAddress(
        await lendingPool.getAddress(),
        await borrower.getAddress()
      );

    return {
      borrower,
      mockToken,
      lendingPool,
      priceOracle,
      interestRate,
      collateralManager,
      admin,
      user1,
      user2,
      user3,
    };
  }

  it("Should revert when non-admin tries to set contract addresses", async function () {
    const {
      borrower,
      collateralManager,
      lendingPool,
      priceOracle,
      interestRate,
      user1,
    } = await loadFixture(setup);

    // Gọi hàm setContractAddress từ tài khoản không phải admin (user1)
    await expect(
      borrower
        .connect(user1)
        .setContractAddress(
          collateralManager.getAddress(),
          lendingPool.getAddress(),
          priceOracle.getAddress(),
          interestRate.getAddress()
        )
    ).to.be.revertedWith("Only Admin can call this function");
  });

  it("Should allow admin to set contract addresses", async function () {
    const {
      borrower,
      collateralManager,
      lendingPool,
      priceOracle,
      interestRate,
      admin,
    } = await loadFixture(setup);

    // Admin gọi hàm setContractAddress và kiểm tra xem sự kiện có được phát ra đúng không
    await expect(
      borrower
        .connect(admin)
        .setContractAddress(
          await lendingPool.getAddress(),
          await interestRate.getAddress(),
          await priceOracle.getAddress(),
          await collateralManager.getAddress()
        )
    )
      .to.emit(borrower, "SetContractAddress")
      .withArgs(
        await lendingPool.getAddress(),
        await interestRate.getAddress(),
        await priceOracle.getAddress(),
        await collateralManager.getAddress()
      );
  });
  ///////////////////////////setFees///////////////////////////
  ///////////////////////////setFees///////////////////////////
  it("setFees", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
      user2,
    } = await setup();
    await borrower.setFee(1000);
    expect(await borrower.fee()).to.equal(1000);
  });
  it("should revert when a non-admin tries to set the fee", async function () {
    const { borrower, user1 } = await setup(); // user1 không phải admin

    await expect(borrower.connect(user1).setFee(1000)).to.be.revertedWith(
      "Only Admin can call this function"
    );
  });

  ///////////////////////////setRickparmetes///////////////////////////
  ///////////////////////////setRickparmetes///////////////////////////
  it("Should revert when non-admin tries to set risk parameters", async function () {
    const { borrower, user1 } = await loadFixture(setup);

    const asset = "0x1234567890abcdef1234567890abcdef12345678"; // Địa chỉ  hợp lệ
    const LTV = 75; // Giá trị LTV hợp lệ
    const liquidationThreshold = 50; // Giá trị liquidationThreshold hợp lệ

    // Gọi hàm setRickparmetes từ tài khoản không phải admin (user1)
    await expect(
      borrower.connect(user1).setRickParams(asset, LTV, liquidationThreshold)
    ).to.be.revertedWith("Only Admin can call this function");
  });

  it("Should revert when liquidationThreshold is greater than or equal to LTV", async function () {
    const { borrower, admin } = await loadFixture(setup);

    const asset = "0x0000000000000000000000000000000000000000";
    const LTV = 75; // Giá trị LTV hợp lệ
    const liquidationThreshold = 75; // Giả sử liquidationThreshold = LTV, sẽ revert

    // Gọi hàm setRickparmetes với liquidationThreshold >= LTV
    await expect(
      borrower.connect(admin).setRickParams(asset, LTV, liquidationThreshold)
    ).to.be.revertedWith("LTV should be less than liquidation threshold");
  });
  it("should fail to set risk parameters if LTV is not less than liquidation threshold", async function () {
    const { mockToken, admin, borrower } = await loadFixture(setup);

    const ltv = ethers.parseUnits("0.08", 4); // 800
    const liquidationThreshold = ethers.parseUnits("0.08", 4); // 800 (equal to LTV)

    await expect(
      borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), ltv, liquidationThreshold)
    ).to.be.revertedWith("LTV should be less than liquidation threshold");
  });
  it("should fail to set risk parameters if LTV is not less than liquidation threshold", async function () {
    const { mockToken, admin, borrower } = await loadFixture(setup);

    // Set LTV and liquidationThreshold to the same value to trigger the require statement
    const ltv = ethers.parseUnits("0.08", 4); // 800
    const liquidationThreshold = ethers.parseUnits("0.08", 4); // 800 (equal to LTV)

    // Call setRickParams and expect it to revert
    await expect(
      borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), ltv, liquidationThreshold)
    ).to.be.revertedWith("LTV should be less than liquidation threshold");
  });
  it("should set risk parameters successfully when called by admin with valid inputs", async function () {
    const { borrower, admin, mockToken } = await loadFixture(setup);

    const ltv = ethers.parseUnits("0.07", 4); // 700
    const liquidationThreshold = ethers.parseUnits("0.08", 4); // 800

    const tokenAddress = await mockToken.getAddress();

    // Gọi hàm và chờ event
    await expect(
      borrower
        .connect(admin)
        .setRickParams(tokenAddress, liquidationThreshold, ltv)
    )
      .to.emit(borrower, "RickParamsSet")
      .withArgs(tokenAddress, liquidationThreshold, ltv);

    // Kiểm tra dữ liệu đã lưu trong mapping
    const params = await borrower.rickParams(tokenAddress);
    expect(params.ltv).to.equal(ltv);
    expect(params.liquidationThreshold).to.equal(liquidationThreshold);
  });

  ////////////////////////CreateLoan///////////////////////////
  /////////////////////////CreateLoan///////////////////////////

  /////////////////////////getAllloanIds////////////////////////////
  /////////////////////////getAllloanIds////////////////////////////
  it("Should return an empty array when no loans are created", async function () {
    const { borrower } = await setup();

    // Gọi hàm getAllloanIds
    const loanIds = await borrower.getAllloanIds();

    // Kiểm tra mảng rỗng
    expect(loanIds).to.deep.equal([]);
  });
  describe("createLoan function tests", function () {
    it("Should create a loan successfully with valid parameters", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for admin and user1
      const initialSupply = ethers.parseUnits("10000", 18);
      await mockToken.connect(admin).mint(admin.address, initialSupply);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters
      const ltv = ethers.parseUnits("0.5", 4); // 50%
      const liquidationThreshold = ethers.parseUnits("0.75", 4); // 75%
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8); // $100
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Deposit to lending pool from admin
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await lendingPool
        .connect(admin)
        .deposit(mockToken.getAddress(), depositAmount, {
          value: serviceFee,
        });

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Create loan
      const loanAmount = ethers.parseUnits("5", 18);
      const collateralAddresses = [await mockToken.getAddress()];

      // Create loan and expect event
      await expect(
        borrower
          .connect(user1)
          .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
            value: serviceFee,
          })
      )
        .to.emit(borrower, "LoanCreated")
        .withArgs(
          1, // loanId
          user1.address,
          await mockToken.getAddress(),
          loanAmount,
          collateralAddresses
        );

      // Verify loan data
      const loan = await borrower.loans(1);
      expect(loan.id).to.equal(1n);
      expect(loan.borrower).to.equal(user1.address);
      expect(loan.assetAdddress).to.equal(await mockToken.getAddress());
      expect(loan.assetAmount).to.equal(loanAmount);
    });

    it("Should revert when fee is not paid", async function () {
      const { borrower, mockToken, admin, user1, priceOracle } = await setup();

      // Mint tokens for user1
      const initialSupply = ethers.parseUnits("1000", 18);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      const loanAmount = ethers.parseUnits("5", 18);
      const collateralAddresses = [await mockToken.getAddress()];

      await expect(
        borrower
          .connect(user1)
          .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
            value: 0,
          })
      ).to.be.revertedWith("Fee is not paid");
    });

    it("Should revert when collateral is locked", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for admin and user1
      const initialSupply = ethers.parseUnits("10000", 18);
      await mockToken.connect(admin).mint(admin.address, initialSupply);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters
      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Deposit to lending pool from admin
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await lendingPool
        .connect(admin)
        .deposit(mockToken.getAddress(), depositAmount, {
          value: serviceFee,
        });

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Create first loan
      const loanAmount = ethers.parseUnits("5", 18);
      const collateralAddresses = [await mockToken.getAddress()];
      await borrower
        .connect(user1)
        .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
          value: serviceFee,
        });

      // Try to create second loan with same collateral
      await expect(
        borrower
          .connect(user1)
          .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
            value: serviceFee,
          })
      ).to.be.revertedWith("Collateral is locked");
    });

    it("Should revert when no collateral addresses provided", async function () {
      const { borrower, mockToken, admin, user1, priceOracle } = await setup();

      // Mint tokens for user1
      const initialSupply = ethers.parseUnits("1000", 18);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      const loanAmount = ethers.parseUnits("5", 18);
      const collateralAddresses: string[] = [];

      await expect(
        borrower
          .connect(user1)
          .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
            value: serviceFee,
          })
      ).to.be.revertedWith("Collateral Addresses should be greater than 0");
    });

    it("Should revert when loan amount exceeds maximum allowed", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for user1
      const initialSupply = ethers.parseUnits("1000", 18);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters with low LTV
      const ltv = ethers.parseUnits("0.1", 4); // 10%
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Deposit to lending pool
      const depositAmount = ethers.parseUnits("1000", 18);
      await mockToken
        .connect(user1)
        .approve(lendingPool.getAddress(), depositAmount);
      await lendingPool
        .connect(user1)
        .deposit(mockToken.getAddress(), depositAmount, {
          value: serviceFee,
        });

      // Add collateral
      const collateralAmount = ethers.parseUnits("10", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Try to create loan with amount exceeding max allowed
      const loanAmount = ethers.parseUnits("1000", 18); // Very large amount
      const collateralAddresses = [await mockToken.getAddress()];

      await expect(
        borrower
          .connect(user1)
          .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
            value: serviceFee,
          })
      ).to.be.revertedWith("Invalid asset amount");
    });

    it("Should revert when collateral value is insufficient", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for user1
      const initialSupply = ethers.parseUnits("1000", 18);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters with high LTV
      const ltv = ethers.parseUnits("0.9", 4); // 90%
      const liquidationThreshold = ethers.parseUnits("0.95", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Add small amount of collateral
      const collateralAmount = ethers.parseUnits("1", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Try to create loan with amount exceeding collateral value
      const loanAmount = ethers.parseUnits("1000", 18);
      const collateralAddresses = [await mockToken.getAddress()];

      await expect(
        borrower
          .connect(user1)
          .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
            value: serviceFee,
          })
      ).to.be.revertedWith("Invalid asset amount");
    });

    it("Should revert when token price is invalid", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for user1
      const initialSupply = ethers.parseUnits("1000", 18);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters
      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Don't set token price to simulate invalid price
      // await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), 0);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Try to create loan
      const loanAmount = ethers.parseUnits("5", 18);
      const collateralAddresses = [await mockToken.getAddress()];

      await expect(
        borrower
          .connect(user1)
          .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
            value: serviceFee,
          })
      ).to.be.revertedWith("No price available");
    });

    it("Should revert when lending pool has insufficient funds", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for user1
      const initialSupply = ethers.parseUnits("1000", 18);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters
      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Try to create loan without depositing to lending pool
      const loanAmount = ethers.parseUnits("5", 18);
      const collateralAddresses = [await mockToken.getAddress()];

      await expect(
        borrower
          .connect(user1)
          .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
            value: serviceFee,
          })
      ).to.be.revertedWith("not enough balance");
    });

    it("Should revert when fee transfer fails", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for user1
      const initialSupply = ethers.parseUnits("1000", 18);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees with very high fee
      const serviceFee = ethers.parseUnits("1000", 18); // Very high fee
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters
      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Try to create loan with insufficient fee
      const loanAmount = ethers.parseUnits("5", 18);
      const collateralAddresses = [await mockToken.getAddress()];

      await expect(
        borrower
          .connect(user1)
          .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
            value: ethers.parseUnits("0.01", 18), // Send less than required fee
          })
      ).to.be.revertedWith("Fee is not paid");
    });

    it("Should revert when fee transfer to lending pool fails", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for admin and user1
      const initialSupply = ethers.parseUnits("10000", 18);
      await mockToken.connect(admin).mint(admin.address, initialSupply);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees with very high fee
      const serviceFee = ethers.parseUnits("1000", 18); // Very high fee
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters
      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Deposit to lending pool
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await lendingPool
        .connect(admin)
        .deposit(mockToken.getAddress(), depositAmount, {
          value: serviceFee,
        });

      // Try to create loan with insufficient fee
      const loanAmount = ethers.parseUnits("5", 18);
      const collateralAddresses = [await mockToken.getAddress()];

      // Send less ETH than required fee
      await expect(
        borrower
          .connect(user1)
          .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
            value: ethers.parseUnits("0.01", 18), // Send much less than required fee
          })
      ).to.be.revertedWith("Fee is not paid");
    });
  });

  describe("removeLoanIdFromBorrower function tests", function () {
    it("Should remove loanId from borrower's loan list when it exists", async function () {
      const {
        borrower,
        mockToken,
        admin,
        user1,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
      } = await setup();

      // Deploy additional tokens for collateral and assets
      const MockTokenFactory = await ethers.getContractFactory("MockToken");
      const mockToken2 = await MockTokenFactory.deploy(admin.address);
      const mockToken3 = await MockTokenFactory.deploy(admin.address);

      // Mint tokens for admin and user1
      const initialSupply = ethers.parseUnits("10000", 18);
      await mockToken.connect(admin).mint(admin.address, initialSupply);
      await mockToken.connect(admin).mint(user1.address, initialSupply);
      await mockToken2.connect(admin).mint(admin.address, initialSupply);
      await mockToken2.connect(admin).mint(user1.address, initialSupply);
      await mockToken3.connect(admin).mint(admin.address, initialSupply);
      await mockToken3.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters for all tokens
      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);
      await borrower
        .connect(admin)
        .setRickParams(
          await mockToken2.getAddress(),
          liquidationThreshold,
          ltv
        );
      await borrower
        .connect(admin)
        .setRickParams(
          await mockToken3.getAddress(),
          liquidationThreshold,
          ltv
        );

      // Set token prices
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken2.getAddress(), tokenPrice);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken3.getAddress(), tokenPrice);

      // Set up interest rate parameters for all tokens
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken2.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken3.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken2.getAddress());
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken3.getAddress());

      // Approve tokens as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken2.getAddress());
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken3.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken2.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken3.getAddress());

      // Deposit to lending pool for all tokens
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await mockToken2
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await mockToken3
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await lendingPool
        .connect(admin)
        .deposit(mockToken.getAddress(), depositAmount, { value: serviceFee });
      await lendingPool
        .connect(admin)
        .deposit(mockToken2.getAddress(), depositAmount, { value: serviceFee });
      await lendingPool
        .connect(admin)
        .deposit(mockToken3.getAddress(), depositAmount, { value: serviceFee });

      // Add collateral for first loan
      const collateralAmount1 = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount1);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount1, {
          value: serviceFee,
        });

      // Create first loan with mockToken2 as asset
      const loanAmount = ethers.parseUnits("5", 18);
      const collateralAddresses1 = [await mockToken.getAddress()];
      await borrower
        .connect(user1)
        .createLoan(mockToken2.getAddress(), loanAmount, collateralAddresses1, {
          value: serviceFee,
        });

      // Add collateral for second loan
      const collateralAmount2 = ethers.parseUnits("100", 18);
      await mockToken2
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount2);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken2.getAddress(), collateralAmount2, {
          value: serviceFee,
        });

      // Create second loan with mockToken3 as asset
      const collateralAddresses2 = [await mockToken2.getAddress()];
      await borrower
        .connect(user1)
        .createLoan(mockToken3.getAddress(), loanAmount, collateralAddresses2, {
          value: serviceFee,
        });

      // Get initial loan count
      const initialLoans = await borrower.borrowerLoans(user1.address, 0);
      expect(initialLoans).to.equal(1n);

      // Repay first loan to trigger removeLoanIdFromBorrower
      const [totalRepayment] = await borrower.calculateTotalRepayment(1);
      await mockToken2
        .connect(user1)
        .approve(borrower.getAddress(), totalRepayment);
      await borrower
        .connect(user1)
        .repayLoan(1, totalRepayment, { value: serviceFee });

      // Check if loanId was removed
      const remainingLoans = await borrower.borrowerLoans(user1.address, 0);
      expect(remainingLoans).to.equal(2n); // Second loan should remain
    });

    it("Should handle case when loanId is not in borrower's list", async function () {
      const {
        borrower,
        mockToken,
        admin,
        user1,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
      } = await setup();

      // Deploy additional token for asset
      const MockTokenFactory = await ethers.getContractFactory("MockToken");
      const mockToken2 = await MockTokenFactory.deploy(admin.address);

      // Mint tokens for admin and user1
      const initialSupply = ethers.parseUnits("10000", 18);
      await mockToken.connect(admin).mint(admin.address, initialSupply);
      await mockToken.connect(admin).mint(user1.address, initialSupply);
      await mockToken2.connect(admin).mint(admin.address, initialSupply);
      await mockToken2.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters for all tokens
      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);
      await borrower
        .connect(admin)
        .setRickParams(
          await mockToken2.getAddress(),
          liquidationThreshold,
          ltv
        );

      // Set token prices
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken2.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken2.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken2.getAddress());

      // Approve tokens as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken2.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken2.getAddress());

      // Deposit to lending pool
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await mockToken2
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await lendingPool
        .connect(admin)
        .deposit(mockToken.getAddress(), depositAmount, { value: serviceFee });
      await lendingPool
        .connect(admin)
        .deposit(mockToken2.getAddress(), depositAmount, { value: serviceFee });

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Create a loan for user1 with mockToken2 as asset
      const loanAmount = ethers.parseUnits("5", 18);
      const collateralAddresses = [await mockToken.getAddress()];

      await borrower
        .connect(user1)
        .createLoan(mockToken2.getAddress(), loanAmount, collateralAddresses, {
          value: serviceFee,
        });

      // Get initial loan count
      const initialLoans = await borrower.borrowerLoans(user1.address, 0);
      expect(initialLoans).to.equal(1n);

      // Try to repay a non-existent loan
      const nonExistentLoanId = 999;
      await expect(
        borrower
          .connect(user1)
          .repayLoan(nonExistentLoanId, loanAmount, { value: serviceFee })
      ).to.be.revertedWith("Invalid borrower");

      // Check if loan list remains unchanged
      const remainingLoans = await borrower.borrowerLoans(user1.address, 0);
      expect(remainingLoans).to.equal(1n);
    });

    it("Should handle case when borrower has no loans", async function () {
      const { borrower, user1, admin } = await setup();

      // Set up fee
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);

      // Try to repay a non-existent loan
      const nonExistentLoanId = 999;
      await expect(
        borrower
          .connect(user1)
          .repayLoan(nonExistentLoanId, ethers.parseUnits("1", 18), {
            value: serviceFee,
          })
      ).to.be.revertedWith("Invalid borrower");

      // Try to repay another non-existent loan
      const anotherNonExistentLoanId = 1000;
      await expect(
        borrower
          .connect(user1)
          .repayLoan(anotherNonExistentLoanId, ethers.parseUnits("1", 18), {
            value: serviceFee,
          })
      ).to.be.revertedWith("Invalid borrower");
    });

    it("Should remove loanId from the middle of the list", async function () {
      const {
        borrower,
        mockToken,
        admin,
        user1,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
      } = await setup();

      // Deploy additional tokens for collateral and assets
      const MockTokenFactory = await ethers.getContractFactory("MockToken");
      const mockToken2 = await MockTokenFactory.deploy(admin.address);
      const mockToken3 = await MockTokenFactory.deploy(admin.address);
      const mockToken4 = await MockTokenFactory.deploy(admin.address);

      // Mint tokens for admin and user1
      const initialSupply = ethers.parseUnits("10000", 18);
      await mockToken.connect(admin).mint(admin.address, initialSupply);
      await mockToken.connect(admin).mint(user1.address, initialSupply);
      await mockToken2.connect(admin).mint(admin.address, initialSupply);
      await mockToken2.connect(admin).mint(user1.address, initialSupply);
      await mockToken3.connect(admin).mint(admin.address, initialSupply);
      await mockToken3.connect(admin).mint(user1.address, initialSupply);
      await mockToken4.connect(admin).mint(admin.address, initialSupply);
      await mockToken4.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters for all tokens
      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);
      await borrower
        .connect(admin)
        .setRickParams(
          await mockToken2.getAddress(),
          liquidationThreshold,
          ltv
        );
      await borrower
        .connect(admin)
        .setRickParams(
          await mockToken3.getAddress(),
          liquidationThreshold,
          ltv
        );
      await borrower
        .connect(admin)
        .setRickParams(
          await mockToken4.getAddress(),
          liquidationThreshold,
          ltv
        );

      // Set token prices
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken2.getAddress(), tokenPrice);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken3.getAddress(), tokenPrice);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken4.getAddress(), tokenPrice);

      // Set up interest rate parameters for all tokens
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken2.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken3.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken4.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken2.getAddress());
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken3.getAddress());
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken4.getAddress());

      // Approve tokens as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken2.getAddress());
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken3.getAddress());
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken4.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken2.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken3.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken4.getAddress());

      // Deposit to lending pool for all tokens
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await mockToken2
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await mockToken3
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await mockToken4
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await lendingPool
        .connect(admin)
        .deposit(mockToken.getAddress(), depositAmount, { value: serviceFee });
      await lendingPool
        .connect(admin)
        .deposit(mockToken2.getAddress(), depositAmount, { value: serviceFee });
      await lendingPool
        .connect(admin)
        .deposit(mockToken3.getAddress(), depositAmount, { value: serviceFee });
      await lendingPool
        .connect(admin)
        .deposit(mockToken4.getAddress(), depositAmount, { value: serviceFee });

      // Add collateral for first loan
      const collateralAmount1 = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount1);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount1, {
          value: serviceFee,
        });

      // Create first loan with mockToken2 as asset
      const loanAmount = ethers.parseUnits("5", 18);
      const collateralAddresses1 = [await mockToken.getAddress()];
      await borrower
        .connect(user1)
        .createLoan(mockToken2.getAddress(), loanAmount, collateralAddresses1, {
          value: serviceFee,
        });

      // Add collateral for second loan
      const collateralAmount2 = ethers.parseUnits("100", 18);
      await mockToken2
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount2);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken2.getAddress(), collateralAmount2, {
          value: serviceFee,
        });

      // Create second loan with mockToken3 as asset
      const collateralAddresses2 = [await mockToken2.getAddress()];
      await borrower
        .connect(user1)
        .createLoan(mockToken3.getAddress(), loanAmount, collateralAddresses2, {
          value: serviceFee,
        });

      // Add collateral for third loan
      const collateralAmount3 = ethers.parseUnits("100", 18);
      await mockToken3
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount3);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken3.getAddress(), collateralAmount3, {
          value: serviceFee,
        });

      // Create third loan with mockToken4 as asset
      const collateralAddresses3 = [await mockToken3.getAddress()];
      await borrower
        .connect(user1)
        .createLoan(mockToken4.getAddress(), loanAmount, collateralAddresses3, {
          value: serviceFee,
        });

      // Get initial loan count
      const initialLoans = await borrower.borrowerLoans(user1.address, 0);
      expect(initialLoans).to.equal(1n);

      // Repay second loan to trigger removeLoanIdFromBorrower
      const [totalRepayment] = await borrower.calculateTotalRepayment(2);
      await mockToken3
        .connect(user1)
        .approve(borrower.getAddress(), totalRepayment);
      await borrower
        .connect(user1)
        .repayLoan(2, totalRepayment, { value: serviceFee });

      // Check if loanId was removed and list is properly reordered
      const remainingLoans = await borrower.borrowerLoans(user1.address, 0);
      expect(remainingLoans).to.equal(1n);
      const secondLoan = await borrower.borrowerLoans(user1.address, 1);
      expect(secondLoan).to.equal(3n); // Third loan should be moved to second position
    });
  });

  describe("repayLoan function tests", function () {
    it("Should partially repay loan when amount is less than total repayment", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for admin and user1
      const initialSupply = ethers.parseUnits("10000", 18);
      await mockToken.connect(admin).mint(admin.address, initialSupply);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters
      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Deposit to lending pool
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await lendingPool
        .connect(admin)
        .deposit(mockToken.getAddress(), depositAmount, {
          value: serviceFee,
        });

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Create loan
      const loanAmount = ethers.parseUnits("10", 18);
      const collateralAddresses = [await mockToken.getAddress()];
      await borrower
        .connect(user1)
        .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
          value: serviceFee,
        });

      // Get total repayment amount before partial payment
      const [totalRepayment] = await borrower.calculateTotalRepayment(1);
      console.log("Total repayment amount:", totalRepayment.toString());

      // Partially repay loan (repay half of the total repayment)
      const partialRepayment = totalRepayment / BigInt(2);
      console.log("Partial repayment amount:", partialRepayment.toString());

      await mockToken
        .connect(user1)
        .approve(borrower.getAddress(), partialRepayment);

      await expect(
        borrower
          .connect(user1)
          .repayLoan(1, partialRepayment, { value: serviceFee })
      )
        .to.emit(borrower, "LoanRepayed")
        .withArgs(1, user1.address, partialRepayment);

      // Check remaining loan amount
      const loan = await borrower.loans(1);
      console.log("Remaining loan amount:", loan.assetAmount.toString());
      
      // Verify the remaining amount is half of the total repayment
      expect(loan.assetAmount).to.be.above(0);
      expect(loan.assetAmount).to.equal(totalRepayment - partialRepayment);
    });

    it("Should handle excess amount when repayment is more than total repayment", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for admin and user1
      const initialSupply = ethers.parseUnits("10000", 18);
      await mockToken.connect(admin).mint(admin.address, initialSupply);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters
      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Deposit to lending pool
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await lendingPool
        .connect(admin)
        .deposit(mockToken.getAddress(), depositAmount, {
          value: serviceFee,
        });

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Create loan
      const loanAmount = ethers.parseUnits("10", 18);
      const collateralAddresses = [await mockToken.getAddress()];
      await borrower
        .connect(user1)
        .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
          value: serviceFee,
        });

      // Calculate total repayment amount
      const [totalRepayment] = await borrower.calculateTotalRepayment(1);

      // Repay more than total repayment
      const excessRepayment = totalRepayment + ethers.parseUnits("5", 18);
      await mockToken
        .connect(user1)
        .approve(borrower.getAddress(), excessRepayment);

      await expect(
        borrower
          .connect(user1)
          .repayLoan(1, excessRepayment, { value: serviceFee })
      )
        .to.emit(borrower, "LoanRepayed")
        .withArgs(1, user1.address, excessRepayment);

      // Check loan is fully repaid
      const loan = await borrower.loans(1);
      expect(loan.assetAmount).to.equal(0);
    });

    it("Should revert when fee is not paid", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);

      await expect(
        borrower
          .connect(user1)
          .repayLoan(1, ethers.parseUnits("1", 18), { value: 0 })
      ).to.be.revertedWith("Fee is not paid");
    });

    it("Should revert when amount is zero", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for admin and user1
      const initialSupply = ethers.parseUnits("10000", 18);
      await mockToken.connect(admin).mint(admin.address, initialSupply);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters
      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Deposit to lending pool
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await lendingPool
        .connect(admin)
        .deposit(mockToken.getAddress(), depositAmount, {
          value: serviceFee,
        });

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Create loan
      const loanAmount = ethers.parseUnits("10", 18);
      const collateralAddresses = [await mockToken.getAddress()];
      await borrower
        .connect(user1)
        .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
          value: serviceFee,
        });

      // Try to repay with zero amount
      await expect(
        borrower.connect(user1).repayLoan(1, 0, { value: serviceFee })
      ).to.be.revertedWith("Invalid amount");
    });

    it("Should revert when transfer fails", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for admin and user1
      const initialSupply = ethers.parseUnits("10000", 18);
      await mockToken.connect(admin).mint(admin.address, initialSupply);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees with very high fee to cause transfer failure
      const serviceFee = ethers.parseUnits("1000", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters
      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8);
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Deposit to lending pool
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await lendingPool
        .connect(admin)
        .deposit(mockToken.getAddress(), depositAmount, {
          value: serviceFee,
        });

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Create loan
      const loanAmount = ethers.parseUnits("10", 18);
      const collateralAddresses = [await mockToken.getAddress()];
      await borrower
        .connect(user1)
        .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
          value: serviceFee,
        });

      // Try to repay with insufficient fee
      const repayment = ethers.parseUnits("5", 18);
      await mockToken.connect(user1).approve(borrower.getAddress(), repayment);

      await expect(
        borrower
          .connect(user1)
          .repayLoan(1, repayment, { value: ethers.parseUnits("0.01", 18) })
      ).to.be.revertedWith("Fee is not paid");
    });
  });

  describe("getCurrentVariableBorrowRate function tests", function () {
    it("Should return correct variable borrow rate", async function () {
      const { borrower, mockToken, admin, interestRate, lendingPool } =
        await setup();

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await lendingPool.connect(admin).setFee(serviceFee);

      // Set up interest rate parameters with base rate of 500 (5%)
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);

      // Initialize reserve to set up the initial state
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Verify the reserve data
      const reserveData = await interestRate.getReserveData(
        mockToken.getAddress()
      );
      expect(reserveData.currentVariableBorrowRate).to.equal(10000);

      // Get the current variable borrow rate
      const rate = await borrower.getCurrentVariableBorrowRate(
        mockToken.getAddress()
      );

      // The rate should be 10000 (100%) as set in the parameters
      expect(rate).to.equal(10000);
    });
  });

  describe("getLoanHealthFactor function tests", function () {
    it("Should calculate health factor correctly", async function () {
      const {
        borrower,
        lendingPool,
        collateralManager,
        priceOracle,
        interestRate,
        mockToken,
        admin,
        user1,
      } = await setup();

      // Mint tokens for admin and user1
      const initialSupply = ethers.parseUnits("10000", 18);
      await mockToken.connect(admin).mint(admin.address, initialSupply);
      await mockToken.connect(admin).mint(user1.address, initialSupply);

      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

      // Set up risk parameters with conservative values
      const ltv = ethers.parseUnits("0.5", 4); // 50%
      const liquidationThreshold = ethers.parseUnits("0.75", 4); // 75%
      await borrower
        .connect(admin)
        .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

      // Set token price to a reasonable value
      const tokenPrice = ethers.parseUnits("100", 8); // $100
      await priceOracle
        .connect(admin)
        .setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Set up interest rate parameters
      await interestRate
        .connect(admin)
        .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate
        .connect(admin)
        .initializeReserve(mockToken.getAddress());

      // Approve token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Deposit to lending pool
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken
        .connect(admin)
        .approve(lendingPool.getAddress(), depositAmount);
      await lendingPool
        .connect(admin)
        .deposit(mockToken.getAddress(), depositAmount, {
          value: serviceFee,
        });

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        });

      // Create loan
      const loanAmount = ethers.parseUnits("5", 18);
      const collateralAddresses = [await mockToken.getAddress()];
      await borrower
        .connect(user1)
        .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
          value: serviceFee,
        });

      // Get loan details
      const loan = await borrower.loans(1);
      console.log("Loan Asset Amount:", loan.assetAmount.toString());
      console.log("Loan Asset Address:", loan.assetAdddress);

      // Get collateral value
      const totalCollateralValue =
        await collateralManager.getTotalCollateralValue(
          user1.address,
          collateralAddresses
        );
      console.log("Total Collateral Value:", totalCollateralValue.toString());

      // Get asset price
      const assetPrice = await priceOracle.getAssetPrice(
        mockToken.getAddress()
      );
      console.log("Asset Price:", assetPrice.toString());

      // Get total repayment amount
      const [totalLoanAmount] = await borrower.calculateTotalRepayment(1);
      console.log("Total Loan Amount:", totalLoanAmount.toString());

      // Get liquidation threshold
      const liquidationThresholdValue = (
        await borrower.rickParams(mockToken.getAddress())
      ).liquidationThreshold;
      console.log(
        "Liquidation Threshold:",
        liquidationThresholdValue.toString()
      );

      // Get health factor
      const healthFactor = await borrower.getLoanHealthFactor(1);
      console.log("Health Factor:", healthFactor.toString());

      // Calculate expected values
      const collateralValueInUSD =
        (totalCollateralValue * assetPrice) / BigInt(1e18);
      const loanAmountInUSD = (totalLoanAmount * assetPrice) / BigInt(1e18);
      console.log("Collateral Value in USD:", collateralValueInUSD.toString());
      console.log("Loan Amount in USD:", loanAmountInUSD.toString());

      // Verify that health factor is greater than 0
      expect(healthFactor).to.be.gt(0);
    });
  });

  it("Should revert when collateral value is greater than loan value", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await setup();

    // Mint tokens for admin and user1
    const initialSupply = ethers.parseUnits("10000", 18);
    await mockToken.connect(admin).mint(admin.address, initialSupply);
    await mockToken.connect(admin).mint(user1.address, initialSupply);

    // Set up fees
    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setFee(serviceFee);
    await lendingPool.connect(admin).setFee(serviceFee);
    await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

    // Set up risk parameters with very low LTV to ensure collateral value > loan value
    const ltv = ethers.parseUnits("0.1", 4); // 10%
    const liquidationThreshold = ethers.parseUnits("0.2", 4); // 20%
    await borrower
      .connect(admin)
      .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

    // Set token price
    const tokenPrice = ethers.parseUnits("100", 8);
    await priceOracle
      .connect(admin)
      .setCustomPrice(mockToken.getAddress(), tokenPrice);

    // Set up interest rate parameters
    await interestRate
      .connect(admin)
      .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    // Approve token as collateral
    await collateralManager
      .connect(admin)
      .submitCollateralRequest(mockToken.getAddress());
    await collateralManager
      .connect(admin)
      .approveCollateralRequest(mockToken.getAddress());

    // Deposit to lending pool
    const depositAmount = ethers.parseUnits("5000", 18);
    await mockToken
      .connect(admin)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(admin)
      .deposit(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    // Add large amount of collateral
    const collateralAmount = ethers.parseUnits("1000", 18);
    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), collateralAmount);
    await collateralManager
      .connect(user1)
      .addCollateral(mockToken.getAddress(), collateralAmount, {
        value: serviceFee,
      });

    // Create loan with small amount
    const loanAmount = ethers.parseUnits("10", 18);
    const collateralAddresses = [await mockToken.getAddress()];
    await borrower
      .connect(user1)
      .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
        value: serviceFee,
      });

    // Check upkeep and try to perform upkeep
    const [upkeepNeeded, performData] = await borrower.checkUpkeep("0x");
    expect(upkeepNeeded).to.be.false;
    expect(performData).to.equal("0x");
  });

  it("Should revert when loan ID is invalid", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await setup();

    // Set up fees
    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setFee(serviceFee);

    // Check upkeep with invalid loan ID
    const [upkeepNeeded, performData] = await borrower.checkUpkeep("0x");
    expect(upkeepNeeded).to.be.false;
    expect(performData).to.equal("0x");
  });

  describe("performUpkeep function tests", function () {
    it("Should handle non-existent loan IDs", async function () {
      const { borrower } = await setup();
      const nonExistentLoanIds = [999, 1000];
      const performData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256[]"],
        [nonExistentLoanIds]
      );
      await expect(borrower.performUpkeep(performData)).to.be.revertedWith(
        "Invalid loan id"
      );
    });

    // it("Should successfully liquidate a loan when health factor is below 1", async function () {
    //   const {
    //     borrower,
    //     lendingPool,
    //     collateralManager,
    //     priceOracle,
    //     interestRate,
    //     mockToken,
    //     admin,
    //     user1,
    //     user2,
    //   } = await setup();

    //   // Mint tokens for admin, user1 (borrower) and user2 (liquidator)
    //   const initialSupply = ethers.parseUnits("10000", 18);
    //   await mockToken.connect(admin).mint(admin.address, initialSupply);
    //   await mockToken.connect(admin).mint(user1.address, initialSupply);
    //   await mockToken.connect(admin).mint(user2.address, initialSupply);

    //   // Set up fees
    //   const serviceFee = ethers.parseUnits("0.01", 18);
    //   await borrower.connect(admin).setFee(serviceFee);
    //   await lendingPool.connect(admin).setFee(serviceFee);
    //   await collateralManager.connect(admin).setFees(serviceFee, serviceFee);

    //   // Set up risk parameters with high LTV to make loan liquidatable
    //   const ltv = ethers.parseUnits("0.8", 4); // 80%
    //   const liquidationThreshold = ethers.parseUnits("0.85", 4); // 85%
    //   await borrower
    //     .connect(admin)
    //     .setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);

    //   // Set initial token price
    //   const initialTokenPrice = ethers.parseUnits("100", 8); // $100
    //   await priceOracle
    //     .connect(admin)
    //     .setCustomPrice(mockToken.getAddress(), initialTokenPrice);

    //   // Set up interest rate parameters
    //   await interestRate
    //     .connect(admin)
    //     .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
    //   await interestRate
    //     .connect(admin)
    //     .initializeReserve(mockToken.getAddress());

    //   // Approve token as collateral
    //   await collateralManager
    //     .connect(admin)
    //     .submitCollateralRequest(mockToken.getAddress());
    //   await collateralManager
    //     .connect(admin)
    //     .approveCollateralRequest(mockToken.getAddress());

    //   // Deposit to lending pool
    //   const depositAmount = ethers.parseUnits("5000", 18);
    //   await mockToken
    //     .connect(admin)
    //     .approve(lendingPool.getAddress(), depositAmount);
    //   await lendingPool
    //     .connect(admin)
    //     .deposit(mockToken.getAddress(), depositAmount, {
    //       value: serviceFee,
    //     });

    //   // Add collateral
    //   const collateralAmount = ethers.parseUnits("100", 18);
    //   await mockToken
    //     .connect(user1)
    //     .approve(collateralManager.getAddress(), collateralAmount);
    //   await collateralManager
    //     .connect(user1)
    //     .addCollateral(mockToken.getAddress(), collateralAmount, {
    //       value: serviceFee,
    //     });

    //   // Create loan with 80% of collateral value
    //   const loanAmount = ethers.parseUnits("80", 18); // Borrow 80% of collateral value
    //   const collateralAddresses = [await mockToken.getAddress()];
    //   await borrower
    //     .connect(user1)
    //     .createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, {
    //       value: serviceFee,
    //     });

    //   // Simulate price drop to make loan liquidatable
    //   const newTokenPrice = ethers.parseUnits("50", 8); // Price drops to $50 (50% drop)
    //   await priceOracle
    //     .connect(admin)
    //     .setCustomPrice(mockToken.getAddress(), newTokenPrice);

    //   // Check health factor
    //   const healthFactor = await borrower.getLoanHealthFactor(1);
    //   console.log("Health Factor:", healthFactor.toString());

    //   // Calculate expected health factor
    //   const loan = await borrower.loans(1);
    //   const totalCollateralValue = await collateralManager.getTotalCollateralValue(
    //     user1.address,
    //     collateralAddresses
    //   );
    //   const loanAmountInUSD = (loan.assetAmount * newTokenPrice) / BigInt(1e18);
    //   const liquidationThresholdValue = (await borrower.rickParams(mockToken.getAddress())).liquidationThreshold;
    //   const expectedHealthFactor = (totalCollateralValue * liquidationThresholdValue * BigInt(1e18)) / 
    //     (loanAmountInUSD * BigInt(10000));

    //   console.log("Expected Health Factor:", expectedHealthFactor.toString());
    //   expect(healthFactor).to.equal(expectedHealthFactor);
    //   expect(healthFactor).to.be.below(BigInt(1e18)); // Health factor should be below 1

    //   // Prepare for liquidation
    //   const loanValue = (loan.assetAmount * newTokenPrice) / BigInt(1e18);
    //   const liquidationAmount = (loanValue * BigInt(10000)) / liquidationThresholdValue;

    //   // Approve tokens for liquidation
    //   await mockToken
    //     .connect(user2)
    //     .approve(borrower.getAddress(), liquidationAmount);

    //   // Perform liquidation with fee
    //   const loanIds = [1];
    //   const performData = ethers.AbiCoder.defaultAbiCoder().encode(
    //     ["uint256[]"],
    //     [loanIds]
    //   );

    //   await expect(borrower.connect(user2).performUpkeep(performData))
    //     .to.emit(borrower, "LoanLiquidated")
    //     .withArgs(1, user1.address, liquidationAmount);

    //   // Verify loan is removed
    //   const remainingLoans = await borrower.borrowerLoans(user1.address, 0);
    //   expect(remainingLoans).to.equal(0);
    // });

    it("should revert if health factor > 1", async function () {
      const { borrower, mockToken, collateralManager, priceOracle, interestRate, admin, user1, user2, lendingPool } = await setup();
      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);
      // Set up risk parameters
      const ltv = ethers.parseUnits("0.5", 4); // 50%
      const liquidationThreshold = ethers.parseUnits("0.75", 4); // 75%
      await borrower.connect(admin).setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);
      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8); // $100
      await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), tokenPrice);
      // Set up interest rate parameters
      await interestRate.connect(admin).setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate.connect(admin).initializeReserve(mockToken.getAddress());
      // Approve token as collateral
      await collateralManager.connect(admin).submitCollateralRequest(mockToken.getAddress());
      await collateralManager.connect(admin).approveCollateralRequest(mockToken.getAddress());
      // Mint tokens for admin
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken.connect(admin).mint(admin.address, depositAmount);
      // Deposit to lending pool from admin
      await mockToken.connect(admin).approve(lendingPool.getAddress(), depositAmount);
      await lendingPool.connect(admin).deposit(mockToken.getAddress(), depositAmount, { value: serviceFee });
      // Add collateral
      const collateralAmount = ethers.parseUnits("1000", 18);
      await mockToken.connect(user1).approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager.connect(user1).addCollateral(mockToken.getAddress(), collateralAmount, { value: serviceFee });
      // Create loan
      const loanAmount = ethers.parseUnits("10", 18);
      const collateralAddresses = [await mockToken.getAddress()];
      await borrower.connect(user1).createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, { value: serviceFee });
      // Gọi performUpkeep
      await expect(
        borrower.connect(user2).performUpkeep(
          ethers.AbiCoder.defaultAbiCoder().encode(["uint256[]"], [[1]])
        )
      ).to.be.revertedWith("Loan health factor is greater than 1");
    });

   
    it("should successfully liquidate loan", async function () {
      const { borrower, mockToken, collateralManager, priceOracle, interestRate, admin, user1, user2, lendingPool } = await setup();
      
      // Set up fees
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setFee(serviceFee);
      await lendingPool.connect(admin).setFee(serviceFee);
      await collateralManager.connect(admin).setFees(serviceFee, serviceFee);
      
      // Set up risk parameters
      const ltv = ethers.parseUnits("0.8", 4); // 80%
      const liquidationThreshold = ethers.parseUnits("0.85", 4); // 85%
      await borrower.connect(admin).setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);
      
      // Set token price
      const tokenPrice = ethers.parseUnits("100", 8); // $100
      await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), tokenPrice);
      
      // Set up interest rate parameters
      await interestRate.connect(admin).setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate.connect(admin).initializeReserve(mockToken.getAddress());
      
      // Approve token as collateral
      await collateralManager.connect(admin).submitCollateralRequest(mockToken.getAddress());
      await collateralManager.connect(admin).approveCollateralRequest(mockToken.getAddress());
      
      // Mint tokens for admin and user2
      const depositAmount = ethers.parseUnits("5000", 18);
      await mockToken.connect(admin).mint(admin.address, depositAmount);
      await mockToken.connect(admin).mint(user2.address, depositAmount);
      
      // Deposit to lending pool
      await mockToken.connect(admin).approve(lendingPool.getAddress(), depositAmount);
      await lendingPool.connect(admin).deposit(mockToken.getAddress(), depositAmount, { value: serviceFee });
      
      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken.connect(user1).approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager.connect(user1).addCollateral(mockToken.getAddress(), collateralAmount, { value: serviceFee });
      
      // Create loan
      const loanAmount = ethers.parseUnits("80", 18);
      const collateralAddresses = [await mockToken.getAddress()];
      await borrower.connect(user1).createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, { value: serviceFee });
      const loanId = 1;
      
      // Verify initial state
      expect(await collateralManager.isCollateralLocked(user1.address, mockToken.getAddress())).to.be.true;
      const initialLoan = await borrower.loans(loanId);
      expect(initialLoan.borrower).to.equal(user1.address);
      expect(initialLoan.assetAmount).to.equal(loanAmount);
      
      // Get initial loan lists
      const initialAllLoanIds = await borrower.getAllloanIds();
      expect(initialAllLoanIds[0]).to.equal(BigInt(loanId));
      
      // Decrease collateral value to trigger liquidation
      await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), ethers.parseUnits("0.00009", 8));
      
      // Verify health factor is <= 1
      const healthFactor = await borrower.getLoanHealthFactor(loanId);
      expect(healthFactor).to.be.lte(ethers.parseUnits("1", 18));
      
      // Calculate liquidation amount
      const [totalRepayment] = await borrower.calculateTotalRepayment(loanId);
      
      // Mint and approve tokens for liquidator
      await mockToken.connect(admin).mint(user2.address, totalRepayment);
      await mockToken.connect(user2).approve(borrower.getAddress(), totalRepayment);
      
      // Get initial balances
      const initialLiquidatorBalance = await mockToken.balanceOf(user2.address);
      const initialLendingPoolBalance = await mockToken.balanceOf(lendingPool.getAddress());
      
      // Perform liquidation
      const tx = await borrower.connect(user2).performUpkeep(
        ethers.AbiCoder.defaultAbiCoder().encode(["uint256[]"], [[loanId]])
      );
      
      // Verify LoanLiquidated event
      await expect(tx)
        .to.emit(borrower, "LoanLiquidated")
        .withArgs(loanId, user1.address, totalRepayment);
      
      // Verify collateral is unlocked
      const isCollateralLocked = await collateralManager.isCollateralLocked(user1.address, mockToken.getAddress());
      expect(isCollateralLocked).to.be.false;
      
      // Verify loan is removed from global loan list
      const allLoanIds = await borrower.getAllloanIds();
      expect(allLoanIds.length).to.equal(0);
      
      // Verify token transfers
      const finalLiquidatorBalance = await mockToken.balanceOf(user2.address);
      const finalLendingPoolBalance = await mockToken.balanceOf(lendingPool.getAddress());
      
      expect(finalLiquidatorBalance).to.equal(initialLiquidatorBalance - totalRepayment);
      expect(finalLendingPoolBalance).to.equal(initialLendingPoolBalance + totalRepayment);
    });
  
  });

  // it("should revert if loan amount in USD is 0", async function () {
  //   const { borrower, mockToken, collateralManager, priceOracle, interestRate, admin, user1, user2, lendingPool } = await setup();
    
  //   // Set up fees
  //   const serviceFee = ethers.parseUnits("0.01", 18);
  //   await borrower.connect(admin).setFee(serviceFee);
  //   await lendingPool.connect(admin).setFee(serviceFee);
  //   await collateralManager.connect(admin).setFees(serviceFee, serviceFee);
    
  //   // Set up risk parameters
  //   const ltv = ethers.parseUnits("0.8", 4); // 80%
  //   const liquidationThreshold = ethers.parseUnits("0.85", 4); // 85%
  //   await borrower.connect(admin).setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);
    
  //   // Set token price to normal value first to allow loan creation
  //   const initialTokenPrice = ethers.parseUnits("100", 8); // $100
  //   await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), initialTokenPrice);
    
  //   // Set up interest rate parameters
  //   await interestRate.connect(admin).setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
  //   await interestRate.connect(admin).initializeReserve(mockToken.getAddress());
    
  //   // Approve token as collateral
  //   await collateralManager.connect(admin).submitCollateralRequest(mockToken.getAddress());
  //   await collateralManager.connect(admin).approveCollateralRequest(mockToken.getAddress());
    
  //   // Mint tokens for admin and user2
  //   const depositAmount = ethers.parseUnits("5000", 18);
  //   await mockToken.connect(admin).mint(admin.address, depositAmount);
  //   await mockToken.connect(admin).mint(user2.address, depositAmount);
    
  //   // Deposit to lending pool
  //   await mockToken.connect(admin).approve(lendingPool.getAddress(), depositAmount);
  //   await lendingPool.connect(admin).deposit(mockToken.getAddress(), depositAmount, { value: serviceFee });
    
  //   // Add collateral
  //   const collateralAmount = ethers.parseUnits("1000", 18);
  //   await mockToken.connect(user1).approve(collateralManager.getAddress(), collateralAmount);
  //   await collateralManager.connect(user1).addCollateral(mockToken.getAddress(), collateralAmount, { value: serviceFee });
    
  //   // Create loan with valid amount
  //   const loanAmount = ethers.parseUnits("800", 18); // 80% of collateral
  //   const collateralAddresses = [await mockToken.getAddress()];
  //   await borrower.connect(user1).createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, { value: serviceFee });
  //   const loanId = 1;
    
  //   // Now set token price to 0 to make loanAmountInUSD = 0
  //   const zeroTokenPrice = ethers.parseUnits("0", 8);
  //   await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), zeroTokenPrice);
    
  //   // Try to get health factor - should revert
  //   await expect(borrower.getLoanHealthFactor(loanId))
  //     .to.be.revertedWith("Loan amount in USD must be greater than 0");
  // });

  // it("should revert if loan amount in USD is negative", async function () {
  //   const { borrower, mockToken, collateralManager, priceOracle, interestRate, admin, user1, user2, lendingPool } = await setup();
    
  //   // Set up fees
  //   const serviceFee = ethers.parseUnits("0.01", 18);
  //   await borrower.connect(admin).setFee(serviceFee);
  //   await lendingPool.connect(admin).setFee(serviceFee);
  //   await collateralManager.connect(admin).setFees(serviceFee, serviceFee);
    
  //   // Set up risk parameters
  //   const ltv = ethers.parseUnits("0.8", 4); // 80%
  //   const liquidationThreshold = ethers.parseUnits("0.85", 4); // 85%
  //   await borrower.connect(admin).setRickParams(await mockToken.getAddress(), liquidationThreshold, ltv);
    
  //   // Set token price to normal value first to allow loan creation
  //   const initialTokenPrice = ethers.parseUnits("100", 8); // $100
  //   await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), initialTokenPrice);
    
  //   // Set up interest rate parameters
  //   await interestRate.connect(admin).setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);
  //   await interestRate.connect(admin).initializeReserve(mockToken.getAddress());
    
  //   // Approve token as collateral
  //   await collateralManager.connect(admin).submitCollateralRequest(mockToken.getAddress());
  //   await collateralManager.connect(admin).approveCollateralRequest(mockToken.getAddress());
    
  //   // Mint tokens for admin and user2
  //   const depositAmount = ethers.parseUnits("5000", 18);
  //   await mockToken.connect(admin).mint(admin.address, depositAmount);
  //   await mockToken.connect(admin).mint(user2.address, depositAmount);
    
  //   // Deposit to lending pool
  //   await mockToken.connect(admin).approve(lendingPool.getAddress(), depositAmount);
  //   await lendingPool.connect(admin).deposit(mockToken.getAddress(), depositAmount, { value: serviceFee });
    
  //   // Add collateral
  //   const collateralAmount = ethers.parseUnits("1000", 18);
  //   await mockToken.connect(user1).approve(collateralManager.getAddress(), collateralAmount);
  //   await collateralManager.connect(user1).addCollateral(mockToken.getAddress(), collateralAmount, { value: serviceFee });
    
  //   // Create loan with valid amount
  //   const loanAmount = ethers.parseUnits("800", 18); // 80% of collateral
  //   const collateralAddresses = [await mockToken.getAddress()];
  //   await borrower.connect(user1).createLoan(mockToken.getAddress(), loanAmount, collateralAddresses, { value: serviceFee });
  //   const loanId = 1;
    
  //   // Now set token price to 0 to make loanAmountInUSD = 0
  //   const zeroTokenPrice = ethers.parseUnits("0", 8);
  //   await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), zeroTokenPrice);
    
  //   // Try to get health factor - should revert
  //   await expect(borrower.getLoanHealthFactor(loanId))
  //     .to.be.revertedWith("Loan amount in USD must be greater than 0");
  // });
});
