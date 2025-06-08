import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PriceOracle", function () {
  async function setup() {
    const [admin, user1, user2] = await ethers.getSigners();
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy();

    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy(admin.address);

    return {
      admin,
      user1,
      user2,
      priceOracle,
      mockToken,
    };
  }
  it("Should set the admin to the deployer", async function () {
    const { priceOracle, admin } = await loadFixture(setup);
    expect(await priceOracle.admin()).to.equal(admin.address);
  });
  //////////////////////////setPriceOracle/////////////////////////
  //////////////////////////setPriceOracle/////////////////////////
  it("Should allow the admin to set an asset oracle", async function () {
    const { priceOracle, admin } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const oracle = "0x0987654321098765432109876543210987654321";

    // Admin có quyền thiết lập price oracle
    await priceOracle.connect(admin).setPriceOracle(asset, oracle);
    expect(await priceOracle.priceOracles(asset)).to.equal(oracle);
  });

  it("Should not allow non-admins to set an asset oracle", async function () {
    const { priceOracle, user1 } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const oracle = "0x0987654321098765432109876543210987654321";

    // Kiểm tra người không phải admin không thể thiết lập price oracle
    await expect(
      priceOracle.connect(user1).setPriceOracle(asset, oracle)
    ).to.be.revertedWith("PriceOracle: Only admin");
  });

  it("Should emit PriceOracleSet event when admin sets an oracle", async function () {
    const { priceOracle, admin } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const oracle = "0x0987654321098765432109876543210987654321";
    
    // Kiểm tra sự kiện được phát ra khi admin thiết lập price oracle
    await expect(priceOracle.connect(admin).setPriceOracle(asset, oracle))
      .to.emit(priceOracle, "PriceOracleSet")
      .withArgs(asset, oracle); // Kiểm tra rằng sự kiện được phát ra với các tham số đúng
  });
  ////////////////////////////////setCustomPrice//////////////////////////
  ////////////////////////////////setCustomPrice//////////////////////////
  it("Should allow the admin to set a custom price for an asset", async function () {
    const { priceOracle, admin } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const price = ethers.parseUnits("100", 18); // Thiết lập giá cho tài sản

    // Admin có quyền thiết lập giá cho tài sản
    await priceOracle.connect(admin).setCustomPrice(asset, price);

    // Kiểm tra giá của tài sản đã được thiết lập chính xác
    expect(await priceOracle.CustomPrice(asset)).to.equal(price);
  });

  it("Should not allow non-admins to set a custom price for an asset", async function () {
    const { priceOracle, user1 } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const price = ethers.parseUnits("100", 18); // Thiết lập giá cho tài sản

    // Kiểm tra người không phải admin không thể thiết lập giá tài sản
    await expect(
      priceOracle.connect(user1).setCustomPrice(asset, price)
    ).to.be.revertedWith("PriceOracle: Only admin");
  });

  it("Should emit CustomPriceSet event when admin sets a custom price", async function () {
    const { priceOracle, admin } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const price = ethers.parseUnits("100", 18); // Thiết lập giá cho tài sản

    // Kiểm tra sự kiện được phát ra khi admin thiết lập giá tài sản
    await expect(priceOracle.connect(admin).setCustomPrice(asset, price))
      .to.emit(priceOracle, "CustomPriceSet")
      .withArgs(asset, price); // Kiểm tra rằng sự kiện được phát ra với các tham số đúng
  });
  ////////////////////////////////getPrice//////////////////////////
  ////////////////////////////////getPrice//////////////////////////
  it("Should return custom price if set", async function () {
    const { priceOracle, admin } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const price = ethers.parseUnits("100", 18); // Thiết lập giá tùy chỉnh cho tài sản

    // Admin thiết lập giá tùy chỉnh cho tài sản
    await priceOracle.connect(admin).setCustomPrice(asset, price);

    // Kiểm tra hàm getAssetPrice trả về giá tùy chỉnh
    expect(await priceOracle.getAssetPrice(asset)).to.equal(price);
  });

  it("Should revert if no price available", async function () {
    const { priceOracle } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890"; // Tài sản chưa được thiết lập giá

    // Kiểm tra nếu không có giá và không có Oracle, hàm sẽ revert
    await expect(priceOracle.getAssetPrice(asset)).to.be.revertedWith(
      "No price available"
    );
  });
  it("Should return price from Chainlink Oracle if custom price is not available", async function () {
    const { admin, mockToken, priceOracle } = await loadFixture(setup);

    const MockChainlinkOracle = await ethers.getContractFactory(
      "MockChainlinkOracle"
    );
    const mockChainlinkOracle = await MockChainlinkOracle.deploy(
      ethers.parseUnits("150", 18)
    );

    await priceOracle
      .connect(admin)
      .setPriceOracle(mockToken.getAddress(), mockChainlinkOracle.getAddress());

    const price = await priceOracle.getAssetPrice(mockToken.getAddress());
    expect(price).to.equal(ethers.parseUnits("150", 18));
  });
  ////////////////////////////////resetAssetPrice//////////////////////////
    ////////////////////////////////resetAssetPrice//////////////////////////
    it("Should allow the admin to reset the custom price of an asset", async function () {
        const { priceOracle, admin } = await loadFixture(setup);
        const asset = "0x1234567890123456789012345678901234567890";
    
        // Set custom price for the asset
        const customPrice = ethers.parseUnits("200", 18);
        await priceOracle.connect(admin).setCustomPrice(asset, customPrice);
    
        // Reset the custom price
        const tx = await priceOracle.connect(admin).resetAssetPrice(asset);
    
        // Check that the custom price is reset to 0
        expect(await priceOracle.CustomPrice(asset)).to.equal(0);
    
        // Check the emitted event
        await expect(tx)
            .to.emit(priceOracle, "CustomPriceSet")
            .withArgs(asset, 0);
    });
    
    it("Should not allow non-admins to reset the custom price of an asset", async function () {
        const { priceOracle, user1 } = await loadFixture(setup);
        const asset = "0x1234567890123456789012345678901234567890";
    
        // Attempt to reset the custom price as a non-admin
        await expect(
            priceOracle.connect(user1).resetAssetPrice(asset)
        ).to.be.revertedWith("PriceOracle: Only admin");
    });
    ///////////////////////////getPriceFromChainlink/////////////////////////
    ///////////////////////////getPriceFromChainlink/////////////////////////
    it("Should return price from Chainlink Oracle if custom price is not available", async function () {
        const { admin, mockToken, priceOracle } = await loadFixture(setup);
    
        const MockChainlinkOracle = await ethers.getContractFactory(
            "MockChainlinkOracle"
        );
        const mockChainlinkOracle = await MockChainlinkOracle.deploy(
            ethers.parseUnits("150", 18)
        );
    
        await priceOracle
            .connect(admin)
            .setPriceOracle(mockToken.getAddress(), mockChainlinkOracle.getAddress());
    
        const price = await priceOracle.getAssetPrice(mockToken.getAddress());
        expect(price).to.equal(ethers.parseUnits("150", 18));
    });
    it("Should revert if no price available", async function () {
        const { priceOracle } = await loadFixture(setup);
        const asset = "0x1234567890123456789012345678901234567890"; // Asset has no custom price and no Oracle
    
        await expect(priceOracle.getAssetPrice(asset)).to.be.revertedWith(
            "No price available"
        );
    });
    it("Should revert with 'PriceOracle: Invalid price' if Chainlink returns non-positive price", async function () {
        const { admin, mockToken, priceOracle } = await loadFixture(setup);
    
        const MockChainlinkOracle = await ethers.getContractFactory(
            "MockChainlinkOracle"
        );
        const mockChainlinkOracle = await MockChainlinkOracle.deploy(0);
    
        await priceOracle
            .connect(admin)
            .setPriceOracle(mockToken.getAddress(), mockChainlinkOracle.getAddress());
    
        await expect(priceOracle.getAssetPrice(mockToken.getAddress())).to.be.revertedWith(
            "PriceOracle: Invalid price"
        );
    });
    

    
});
