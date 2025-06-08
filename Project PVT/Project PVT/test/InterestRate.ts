import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("InterestRate", function () {
  async function setup() {
    const [admin, user1, user2] = await ethers.getSigners();

    const MockLendingPoolFactory = await ethers.getContractFactory(
      "MockLendingPool"
    );
    const mockLendingPool = await MockLendingPoolFactory.deploy();

    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    const mockToken = await MockTokenFactory.deploy(admin.address);

    const initialSupply = ethers.parseUnits("1000", 18);
    await mockToken.connect(admin).mint(admin.address, initialSupply);
    await mockToken.connect(admin).mint(user1.address, initialSupply);
    await mockToken
      .connect(admin)
      .mint(user2.address, ethers.parseUnits("0.01", 18));

    const PriceOracleFactory = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracleFactory.deploy();

    const LendingPoolFactory = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPoolFactory.deploy();

    const InterestRateFactory = await ethers.getContractFactory("InterestRate");
    const interestRate = await InterestRateFactory.deploy();

    const BorrowerFactory = await ethers.getContractFactory("Borrower");
    const borrower = await BorrowerFactory.deploy();

    const CollateralManagerFactory = await ethers.getContractFactory(
      "CollateralManager"
    );
    const collateralManager = await CollateralManagerFactory.deploy();

    await borrower.setContractAddress(
      priceOracle.getAddress(),
      collateralManager.getAddress(),
      lendingPool.getAddress(),
      interestRate.getAddress()
    );
    await lendingPool.setContractAddress(
      priceOracle.getAddress(),
      collateralManager.getAddress(),
      borrower.getAddress(),
      interestRate.getAddress()
    );
    await interestRate.setContractAddress(
      lendingPool.getAddress(),
      borrower.getAddress()
    );
    await collateralManager.submitCollateralRequest(mockToken.getAddress());
    await collateralManager.approveCollateralRequest(mockToken.getAddress());

    return {
      collateralManager,
      lendingPool,
      mockToken,
      mockLendingPool,
      priceOracle,
      borrower,
      interestRate,
      admin,
      user1,
      user2,
    };
  }

  it("Should revert if mint token by non-admin", async function () {
    const { mockToken, lendingPool, interestRate, user1 } = await loadFixture(
      setup
    );

    const mintAmount = ethers.parseUnits("1000", 18);
    const recipient = user1.address;

    await expect(mockToken.connect(user1).mint(recipient, mintAmount))
      .to.be.revertedWithCustomError(mockToken, "OwnableUnauthorizedAccount")
      .withArgs(user1.address);
  });

  it("Should revert if set contract address by non-admin", async function () {
    const { mockToken, lendingPool, interestRate, user1 } = await loadFixture(
      setup
    );

    await expect(
      interestRate
        .connect(user1)
        .setContractAddress(
          lendingPool.getAddress(),
          interestRate.getAddress()
        )
    ).to.be.revertedWith("only admin");
  });

  it("Should revert if set interest rate params by non-admin", async function () {
    const { mockToken, lendingPool, interestRate, user1 } = await loadFixture(setup);
  
    await expect(
      interestRate
        .connect(user1)
        .setInterestParams(
          await mockToken.getAddress(),
          100, // _slope1
          200, // _slope2
          50,  // _baseRate
          8000 // _utilizationOptimal
        )
    ).to.be.revertedWith("only admin");
  });
  

  it("Should return interest rate parameters correctly", async function () {
    const { mockToken, lendingPool, interestRate, admin, user1 } =
      await loadFixture(setup);

    await interestRate
      .connect(admin)
      .setInterestParams(mockToken.getAddress(), 500, 750, 500, 4000);

    const [slope1, slope2, baseRate] = await interestRate.getInterestRateParmas(
      mockToken.getAddress()
    );

    expect(slope1).to.equal(500);
    expect(slope2).to.equal(750);
    expect(baseRate).to.equal(500);
  });

  it("Should revert if non-admin tries to initialize reserve", async function () {
    const { mockToken, lendingPool, interestRate, admin, user1 } =
      await loadFixture(setup);

    await expect(
      interestRate.connect(user1).initializeReserve(mockToken.getAddress())
    ).to.be.revertedWith("only admin");
  });

  it("Should revert if non-admin tries to update interest rate", async function () {
    const { mockToken, lendingPool, interestRate, admin, user1 } =
      await loadFixture(setup);

    await expect(
      interestRate.connect(user1).updateInterestRate(mockToken.getAddress())
    ).to.be.revertedWith("Only authorized contracts can call this function");
  });
});
