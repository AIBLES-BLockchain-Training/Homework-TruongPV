import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CollateralManager", function () {
  async function setup() {
    const [admin, user1, user2] = await ethers.getSigners();
    const CollateralManager = await ethers.getContractFactory(
      "CollateralManager"
    );
    const collateralManager = await CollateralManager.deploy();

    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();

    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy(admin.address);
    await mockToken.waitForDeployment();
    const initialSupply = ethers.parseUnits("1000", 18);
    await mockToken.connect(admin).mint(admin.address, initialSupply);
    await mockToken.connect(admin).mint(user1.address, initialSupply);
    await mockToken.connect(admin).mint(user2.address, initialSupply);

    const LendingPool = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPool.deploy();
    await lendingPool.waitForDeployment();

    const Borrower = await ethers.getContractFactory("Borrower");
    const borrower = await Borrower.deploy();
    await borrower.waitForDeployment();

    const InterestRate = await ethers.getContractFactory("InterestRate");
    const interestRate = await InterestRate.deploy();
    await interestRate.waitForDeployment();

    // Set contract addresses
    await collateralManager.setContractAddresses(
      priceOracle.getAddress(),
      mockToken.getAddress(),
      lendingPool.getAddress(),
      borrower.getAddress(),
      interestRate.getAddress()
    );

    // Set initial token price
    const initialPrice = ethers.parseUnits("100", 18);
    await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), initialPrice);

    return {
      admin,
      user1,
      user2,
      collateralManager,
      priceOracle,
      mockToken,
      lendingPool,
      borrower,
      interestRate,
    };
  }

  //////////////////////////////setContractAddresses////////////////////////////////////////
  describe("setContractAddresses", function () {
    it("Should set contract addresses when called by admin", async function () {
      const {
        collateralManager,
        priceOracle,
        admin,
        mockToken,
        lendingPool,
        borrower,
        interestRate,
      } = await loadFixture(setup);

      await collateralManager
        .connect(admin)
        .setContractAddresses(
          priceOracle.getAddress(),
          mockToken.getAddress(),
          lendingPool.getAddress(),
          borrower.getAddress(),
          interestRate.getAddress()
        );

      expect(await collateralManager.priceOracle()).to.equal(
        await priceOracle.getAddress()
      );
      expect(await collateralManager.mockToken()).to.equal(
        await mockToken.getAddress()
      );
      expect(await collateralManager.lendingPool()).to.equal(
        await lendingPool.getAddress()
      );
      expect(await collateralManager.borrower()).to.equal(
        await borrower.getAddress()
      );
      expect(await collateralManager.interestRate()).to.equal(
        await interestRate.getAddress()
      );
    });

    it("Should revert if called by non-admin", async function () {
      const {
        collateralManager,
        priceOracle,
        mockToken,
        user1,
        lendingPool,
        borrower,
        interestRate,
      } = await loadFixture(setup);

      await expect(
        collateralManager
          .connect(user1)
          .setContractAddresses(
            priceOracle.getAddress(),
            mockToken.getAddress(),
            lendingPool.getAddress(),
            borrower.getAddress(),
            interestRate.getAddress()
          )
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });

  //////////////////////////////setFees////////////////////////////////////////
  describe("setFees", function () {
    it("Should update fees when called by admin", async function () {
      const { collateralManager, admin } = await loadFixture(setup);

      const newAddCollateralFee = ethers.parseUnits("10", 18);
      const newRemoveCollateralFee = ethers.parseUnits("5", 18);

      await collateralManager
        .connect(admin)
        .setFees(newAddCollateralFee, newRemoveCollateralFee);

      expect(await collateralManager.addCollateralFee()).to.equal(
        newAddCollateralFee
      );
      expect(await collateralManager.removeCollateralFee()).to.equal(
        newRemoveCollateralFee
      );
    });

    it("Should revert if called by non-admin", async function () {
      const { collateralManager, user1 } = await loadFixture(setup);

      const newAddCollateralFee = ethers.parseUnits("10", 18);
      const newRemoveCollateralFee = ethers.parseUnits("5", 18);

      await expect(
        collateralManager
          .connect(user1)
          .setFees(newAddCollateralFee, newRemoveCollateralFee)
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });

  //////////////////////////////setLTVLimit////////////////////////////////////////
  describe("setLTVLimit", function () {
    it("Should update LTV limit when called by admin", async function () {
      const { collateralManager, admin } = await loadFixture(setup);

      const newLTVLimit = 8000; // 80%
      await collateralManager.connect(admin).setLTVLimit(newLTVLimit);

      expect(await collateralManager.LTVLimit()).to.equal(newLTVLimit);
    });

    it("Should revert if called by non-admin", async function () {
      const { collateralManager, user1 } = await loadFixture(setup);

      const newLTVLimit = 8000;
      await expect(
        collateralManager.connect(user1).setLTVLimit(newLTVLimit)
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });

  //////////////////////////////Collateral Request Management////////////////////////////////////////
  describe("Collateral Request Management", function () {
    it("Should allow admin to submit collateral request", async function () {
      const { collateralManager, admin, mockToken } = await loadFixture(setup);

      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());

      expect(
        await collateralManager.pendingCollateralRequests(mockToken.getAddress())
      ).to.be.true;
    });

    it("Should revert when submitting request with zero address", async function () {
      const { collateralManager, admin } = await loadFixture(setup);

      await expect(
        collateralManager
          .connect(admin)
          .submitCollateralRequest(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid token address");
    });

    it("Should revert when submitting request for already pending token", async function () {
      const { collateralManager, admin, mockToken } = await loadFixture(setup);

      // Submit first request
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());

      // Try to submit again
      await expect(
        collateralManager
          .connect(admin)
          .submitCollateralRequest(mockToken.getAddress())
      ).to.be.revertedWith("Request already pending");
    });

    it("Should revert when submitting request for already valid token", async function () {
      const { collateralManager, admin, mockToken } = await loadFixture(setup);

      // First approve the token
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Try to submit request for already valid token
      await expect(
        collateralManager
          .connect(admin)
          .submitCollateralRequest(mockToken.getAddress())
      ).to.be.revertedWith("Token is already valid");
    });

    it("Should revert if called by non-admin", async function () {
      const { collateralManager, user1, mockToken } = await loadFixture(setup);

      await expect(
        collateralManager
          .connect(user1)
          .submitCollateralRequest(mockToken.getAddress())
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should allow admin to approve collateral request", async function () {
      const { collateralManager, admin, mockToken } = await loadFixture(setup);

      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      expect(
        await collateralManager.isApprovedCollateral(mockToken.getAddress())
      ).to.be.true;
      expect(
        await collateralManager.pendingCollateralRequests(mockToken.getAddress())
      ).to.be.false;
    });

    it("Should revert when approving non-pending request", async function () {
      const { collateralManager, admin, mockToken } = await loadFixture(setup);

      await expect(
        collateralManager
          .connect(admin)
          .approveCollateralRequest(mockToken.getAddress())
      ).to.be.revertedWith("No pending request found");
    });

    it("Should revert if called by non-admin", async function () {
      const { collateralManager, admin, user1, mockToken } = await loadFixture(setup);

      // First submit request as admin
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());

      // Try to approve as non-admin
      await expect(
        collateralManager
          .connect(user1)
          .approveCollateralRequest(mockToken.getAddress())
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should add token to validCollateralTokenList when approved", async function () {
      const { collateralManager, admin, mockToken } = await loadFixture(setup);

      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      const validTokens = await collateralManager.getValidCollateralTokens();
      const mockTokenAddress = await mockToken.getAddress();
      expect(validTokens).to.include(mockTokenAddress);
    });

    it("Should allow admin to reject collateral request", async function () {
      const { collateralManager, admin, mockToken } = await loadFixture(setup);

      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .rejectCollateralRequest(mockToken.getAddress());

      expect(
        await collateralManager.pendingCollateralRequests(mockToken.getAddress())
      ).to.be.false;
      expect(
        await collateralManager.isApprovedCollateral(mockToken.getAddress())
      ).to.be.false;
    });

    it("Should revert when rejecting non-pending request", async function () {
      const { collateralManager, admin, mockToken } = await loadFixture(setup);

      await expect(
        collateralManager
          .connect(admin)
          .rejectCollateralRequest(mockToken.getAddress())
      ).to.be.revertedWith("No pending request found");
    });

    it("Should revert if called by non-admin", async function () {
      const { collateralManager, admin, user1, mockToken } = await loadFixture(setup);

      // First submit request as admin
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());

      // Try to reject as non-admin
      await expect(
        collateralManager
          .connect(user1)
          .rejectCollateralRequest(mockToken.getAddress())
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should emit CollateralRequestRejected event when request is rejected", async function () {
      const { collateralManager, admin, mockToken } = await loadFixture(setup);

      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());

      await expect(
        collateralManager
          .connect(admin)
          .rejectCollateralRequest(mockToken.getAddress())
      )
        .to.emit(collateralManager, "CollateralRequestRejected")
        .withArgs(mockToken.getAddress());
    });
  });

  //////////////////////////////Collateral Management////////////////////////////////////////
  describe("Collateral Management", function () {
    it("Should allow users to add collateral", async function () {
      const {
        collateralManager,
        admin,
        user1,
        mockToken,
        lendingPool,
      } = await loadFixture(setup);

      // First approve the token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Set fees
      const addCollateralFee = ethers.parseUnits("0.1", 18);
      await collateralManager.connect(admin).setFees(addCollateralFee, 0);
      await lendingPool.connect(admin).setFee(addCollateralFee);

      // Approve tokens for collateral manager
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);

      // Add collateral with enough ETH for fee
      const tx = await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: addCollateralFee,
        });
      await tx.wait();

      // Verify collateral was added
      const collateralAmountAfter = await collateralManager.getCollateralAmount(
        user1.address,
        mockToken.getAddress()
      );
      expect(collateralAmountAfter).to.equal(collateralAmount);

      // Verify fee was transferred to lendingPool
      const lendingPoolBalance = await ethers.provider.getBalance(lendingPool.getAddress());
      expect(lendingPoolBalance).to.equal(addCollateralFee);
    });

    it("Should revert when adding collateral for invalid token", async function () {
      const { collateralManager, user1, mockToken } = await loadFixture(setup);

      const addCollateralFee = ethers.parseUnits("0.1", 18);
      const collateralAmount = ethers.parseUnits("100", 18);

      await expect(
        collateralManager
          .connect(user1)
          .addCollateral(mockToken.getAddress(), collateralAmount, {
            value: addCollateralFee,
          })
      ).to.be.revertedWith("Invalid asset");
    });

    it("Should revert when adding zero amount collateral", async function () {
      const { collateralManager, admin, user1, mockToken } = await loadFixture(setup);

      // First approve the token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      const addCollateralFee = ethers.parseUnits("0.1", 18);
      const zeroAmount = 0;

      await expect(
        collateralManager
          .connect(user1)
          .addCollateral(mockToken.getAddress(), zeroAmount, {
            value: addCollateralFee,
          })
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should revert when adding collateral with locked status", async function () {
      const { collateralManager, admin, user1, mockToken, lendingPool } = await loadFixture(setup);

      // First approve the token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Set fees
      const addCollateralFee = ethers.parseUnits("0.1", 18);
      await collateralManager.connect(admin).setFees(addCollateralFee, 0);
      await lendingPool.connect(admin).setFee(addCollateralFee);

      // Add initial collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: addCollateralFee,
        });

      // Lock the collateral
      await collateralManager
        .connect(admin)
        .lockCollateral(user1.address, mockToken.getAddress());

      // Try to add more collateral
      await expect(
        collateralManager
          .connect(user1)
          .addCollateral(mockToken.getAddress(), collateralAmount, {
            value: addCollateralFee,
          })
      ).to.be.revertedWith("Collateral is locked");
    });

    it("Should revert when adding collateral with incorrect fee amount", async function () {
      const { collateralManager, admin, user1, mockToken } = await loadFixture(setup);

      // First approve the token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      const addCollateralFee = ethers.parseUnits("0.1", 18);
      const wrongFee = ethers.parseUnits("0.2", 18);
      const collateralAmount = ethers.parseUnits("100", 18);

      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);

      await expect(
        collateralManager
          .connect(user1)
          .addCollateral(mockToken.getAddress(), collateralAmount, {
            value: wrongFee,
          })
      ).to.be.revertedWith("Invalid fee amount");
    });

    it("Should add token to validCollateralTokenList when adding first collateral", async function () {
      const { collateralManager, admin, user1, mockToken, lendingPool } = await loadFixture(setup);

      // First approve the token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Set fees
      const addCollateralFee = ethers.parseUnits("0.1", 18);
      await collateralManager.connect(admin).setFees(addCollateralFee, 0);
      await lendingPool.connect(admin).setFee(addCollateralFee);

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: addCollateralFee,
        });

      // Verify token is in validCollateralTokenList
      const validTokens = await collateralManager.getValidCollateralTokens();
      const mockTokenAddress = await mockToken.getAddress();
      expect(validTokens).to.include(mockTokenAddress);
    });

    it("Should emit CollateralAdded event when adding collateral", async function () {
      const { collateralManager, admin, user1, mockToken, lendingPool } = await loadFixture(setup);

      // First approve the token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Set fees
      const addCollateralFee = ethers.parseUnits("0.1", 18);
      await collateralManager.connect(admin).setFees(addCollateralFee, 0);
      await lendingPool.connect(admin).setFee(addCollateralFee);

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);

      await expect(
        collateralManager
          .connect(user1)
          .addCollateral(mockToken.getAddress(), collateralAmount, {
            value: addCollateralFee,
          })
      )
        .to.emit(collateralManager, "CollateralAdded")
        .withArgs(user1.address, mockToken.getAddress(), collateralAmount);
    });

    it("Should allow users to remove collateral", async function () {
      const {
        collateralManager,
        admin,
        user1,
        mockToken,
        lendingPool,
      } = await loadFixture(setup);

      // First approve the token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Set fees
      const addCollateralFee = ethers.parseUnits("0.1", 18);
      const removeCollateralFee = ethers.parseUnits("0.1", 18);
      await collateralManager
        .connect(admin)
        .setFees(addCollateralFee, removeCollateralFee);

      // Add collateral first
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: addCollateralFee,
        });

      // Remove collateral
      const removeAmount = ethers.parseUnits("50", 18);
      await collateralManager
        .connect(user1)
        .removeCollateral(mockToken.getAddress(), removeAmount, {
          value: removeCollateralFee,
        });

      expect(
        await collateralManager.getCollateralAmount(
          user1.address,
          mockToken.getAddress()
        )
      ).to.equal(collateralAmount - removeAmount);
    });

    it("Should lock and unlock collateral", async function () {
      const {
        collateralManager,
        admin,
        user1,
        mockToken,
        lendingPool,
      } = await loadFixture(setup);

      // First approve the token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Set fees
      const addCollateralFee = ethers.parseUnits("0.1", 18);
      const removeCollateralFee = ethers.parseUnits("0.1", 18);
      await collateralManager
        .connect(admin)
        .setFees(addCollateralFee, removeCollateralFee);

      // Add collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: addCollateralFee,
        });

      // Lock collateral
      await collateralManager
        .connect(admin)
        .lockCollateral(user1.address, mockToken.getAddress());
      expect(
        await collateralManager.isCollateralLocked(
          user1.address,
          mockToken.getAddress()
        )
      ).to.be.true;

      // Unlock collateral
      await collateralManager
        .connect(admin)
        .unlockCollateral(user1.address, mockToken.getAddress());
      expect(
        await collateralManager.isCollateralLocked(
          user1.address,
          mockToken.getAddress()
        )
      ).to.be.false;
    });

    it("Should not add token to validCollateralTokenList when adding more collateral", async function () {
      const { collateralManager, admin, user1, mockToken, lendingPool } = await loadFixture(setup);

      // First approve the token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Set fees
      const addCollateralFee = ethers.parseUnits("0.1", 18);
      await collateralManager.connect(admin).setFees(addCollateralFee, 0);
      await lendingPool.connect(admin).setFee(addCollateralFee);

      // Add first collateral
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: addCollateralFee,
        });

      // Get initial validCollateralTokenList length
      const initialValidTokens = await collateralManager.getValidCollateralTokens();
      const initialLength = initialValidTokens.length;

      // Add more collateral
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: addCollateralFee,
        });

      // Verify validCollateralTokenList length hasn't changed
      const finalValidTokens = await collateralManager.getValidCollateralTokens();
      expect(finalValidTokens.length).to.equal(initialLength);
    });

    it("Should revert when removing collateral for invalid token", async function () {
      const { collateralManager, user1, mockToken } = await loadFixture(setup);
      const removeCollateralFee = ethers.parseUnits("0.1", 18);
      const removeAmount = ethers.parseUnits("10", 18);
      await expect(
        collateralManager.connect(user1).removeCollateral(mockToken.getAddress(), removeAmount, { value: removeCollateralFee })
      ).to.be.revertedWith("Invalid asset");
    });

    it("Should revert when removing zero amount collateral", async function () {
      const { collateralManager, admin, user1, mockToken } = await loadFixture(setup);
      await collateralManager.connect(admin).submitCollateralRequest(mockToken.getAddress());
      await collateralManager.connect(admin).approveCollateralRequest(mockToken.getAddress());
      const removeCollateralFee = ethers.parseUnits("0.1", 18);
      await collateralManager.connect(admin).setFees(0, removeCollateralFee);
      await expect(
        collateralManager.connect(user1).removeCollateral(mockToken.getAddress(), 0, { value: removeCollateralFee })
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should revert when removing collateral with locked status", async function () {
      const { collateralManager, admin, user1, mockToken, lendingPool } = await loadFixture(setup);
      await collateralManager.connect(admin).submitCollateralRequest(mockToken.getAddress());
      await collateralManager.connect(admin).approveCollateralRequest(mockToken.getAddress());
      const addCollateralFee = ethers.parseUnits("0.1", 18);
      const removeCollateralFee = ethers.parseUnits("0.1", 18);
      await collateralManager.connect(admin).setFees(addCollateralFee, removeCollateralFee);
      await lendingPool.connect(admin).setFee(addCollateralFee);
      const collateralAmount = ethers.parseUnits("100", 18);
      await mockToken.connect(user1).approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager.connect(user1).addCollateral(mockToken.getAddress(), collateralAmount, { value: addCollateralFee });
      await collateralManager.connect(admin).lockCollateral(user1.address, mockToken.getAddress());
      await expect(
        collateralManager.connect(user1).removeCollateral(mockToken.getAddress(), ethers.parseUnits("10", 18), { value: removeCollateralFee })
      ).to.be.revertedWith("Collateral is locked");
    });

    it("Should revert when removing more collateral than available", async function () {
      const { collateralManager, admin, user1, mockToken, lendingPool } = await loadFixture(setup);
      await collateralManager.connect(admin).submitCollateralRequest(mockToken.getAddress());
      await collateralManager.connect(admin).approveCollateralRequest(mockToken.getAddress());
      const addCollateralFee = ethers.parseUnits("0.1", 18);
      const removeCollateralFee = ethers.parseUnits("0.1", 18);
      await collateralManager.connect(admin).setFees(addCollateralFee, removeCollateralFee);
      await lendingPool.connect(admin).setFee(addCollateralFee);
      const collateralAmount = ethers.parseUnits("10", 18);
      await mockToken.connect(user1).approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager.connect(user1).addCollateral(mockToken.getAddress(), collateralAmount, { value: addCollateralFee });
      await expect(
        collateralManager.connect(user1).removeCollateral(mockToken.getAddress(), ethers.parseUnits("20", 18), { value: removeCollateralFee })
      ).to.be.revertedWith("Insufficient collateral amount");
    });

    it("Should revert when removing collateral with incorrect fee amount", async function () {
      const { collateralManager, admin, user1, mockToken, lendingPool } = await loadFixture(setup);
      await collateralManager.connect(admin).submitCollateralRequest(mockToken.getAddress());
      await collateralManager.connect(admin).approveCollateralRequest(mockToken.getAddress());
      const addCollateralFee = ethers.parseUnits("0.1", 18);
      const removeCollateralFee = ethers.parseUnits("0.1", 18);
      await collateralManager.connect(admin).setFees(addCollateralFee, removeCollateralFee);
      await lendingPool.connect(admin).setFee(addCollateralFee);
      const collateralAmount = ethers.parseUnits("10", 18);
      await mockToken.connect(user1).approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager.connect(user1).addCollateral(mockToken.getAddress(), collateralAmount, { value: addCollateralFee });
      await expect(
        collateralManager.connect(user1).removeCollateral(mockToken.getAddress(), ethers.parseUnits("5", 18), { value: ethers.parseUnits("0.2", 18) })
      ).to.be.revertedWith("Invalid fee amount");
    });
  });

  //////////////////////////////Collateral Value Calculation////////////////////////////////////////
  describe("Collateral Value Calculation", function () {
    it("Should calculate total collateral value correctly", async function () {
      const {
        collateralManager,
        admin,
        user1,
        mockToken,
        priceOracle,
      } = await loadFixture(setup);

      // First approve the token as collateral
      await collateralManager
        .connect(admin)
        .submitCollateralRequest(mockToken.getAddress());
      await collateralManager
        .connect(admin)
        .approveCollateralRequest(mockToken.getAddress());

      // Set fees
      const addCollateralFee = ethers.parseUnits("0.1", 18);
      const removeCollateralFee = ethers.parseUnits("0.1", 18);
      await collateralManager
        .connect(admin)
        .setFees(addCollateralFee, removeCollateralFee);

      // Set token price in PriceOracle
      const tokenPrice = ethers.parseUnits("100", 18); // $100 per token
      await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Add collateral
      const collateralAmount = ethers.parseUnits("10", 18); // 10 tokens
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: addCollateralFee,
        });

      // Calculate total value
      const totalValue = await collateralManager.getTotalCollateralValue(
        user1.address,
        [mockToken.getAddress()]
      );

      // Expected value: 10 tokens * $100 = $1000
      const expectedValue = (collateralAmount * tokenPrice) / ethers.parseUnits("1", 18);
      expect(totalValue).to.equal(expectedValue);
    });

    it("Should not include unapproved tokens in total collateral value calculation", async function () {
      const {
        collateralManager,
        admin,
        user1,
        mockToken,
        priceOracle,
      } = await loadFixture(setup);

      // Set token price in PriceOracle
      const tokenPrice = ethers.parseUnits("100", 18); // $100 per token
      await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), tokenPrice);

      // Add collateral without approving the token
      const collateralAmount = ethers.parseUnits("10", 18); // 10 tokens
      await mockToken
        .connect(user1)
        .approve(collateralManager.getAddress(), collateralAmount);
      await mockToken
        .connect(user1)
        .transfer(collateralManager.getAddress(), collateralAmount);

      // Calculate total value
      const totalValue = await collateralManager.getTotalCollateralValue(
        user1.address,
        [mockToken.getAddress()]
      );

      // Expected value: 0 since token is not approved
      expect(totalValue).to.equal(0);
    });

    // Test cases for getAssetPrice function
    describe("getAssetPrice", function () {
      it("Should return correct price for approved token", async function () {
        const { collateralManager, admin, mockToken, priceOracle } = await loadFixture(setup);

        // Set token price in PriceOracle
        const tokenPrice = ethers.parseUnits("100", 18);
        await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), tokenPrice);

        // Get asset price
        const price = await collateralManager.getAssetPrice(mockToken.getAddress());
        expect(price).to.equal(tokenPrice);
      });

      it("Should return correct price for unapproved token", async function () {
        const { collateralManager, admin, mockToken, priceOracle } = await loadFixture(setup);

        // Set token price in PriceOracle
        const tokenPrice = ethers.parseUnits("50", 18);
        await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), tokenPrice);

        // Get asset price without approving token
        const price = await collateralManager.getAssetPrice(mockToken.getAddress());
        expect(price).to.equal(tokenPrice);
      });

      it("Should revert when getting price for zero address", async function () {
        const { collateralManager } = await loadFixture(setup);

        // Get asset price for zero address should revert
        await expect(
          collateralManager.getAssetPrice(ethers.ZeroAddress)
        ).to.be.revertedWith("No price available");
      });
    });
  });
});
