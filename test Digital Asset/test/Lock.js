const { expect } = require("chai");

describe("DigitalAsset Contracts", function () {
  let PaintingAsset, paintingAsset, AudioAsset, audioAsset, AssetManufacturer, assetManufacturer;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy PaintingAsset
    PaintingAsset = await ethers.getContractFactory("PaintingAsset");
    paintingAsset = await PaintingAsset.deploy("Leonardo da Vinci", "Mona Lisa");

    // Deploy AudioAsset
    AudioAsset = await ethers.getContractFactory("AudioAsset");
    audioAsset = await AudioAsset.deploy("Bohemian Rhapsody", "Freddie Mercury", "Queen");

    // Deploy AssetManufacturer
    AssetManufacturer = await ethers.getContractFactory("AssetManufacturer");
    assetManufacturer = await AssetManufacturer.deploy();
  });

  describe("PaintingAsset", function () {
    it("should deploy with correct attributes", async function () {
      expect(await paintingAsset.painterName()).to.equal("Leonardo da Vinci");
      expect(await paintingAsset.paintingTitle()).to.equal("Mona Lisa");
      expect(await paintingAsset.fetchDetails()).to.equal("Mona Lisa");
    });

    it("should allow owner to update painter name and painting title", async function () {
      await paintingAsset.updatePainterName("Michelangelo");
      await paintingAsset.updatePaintingTitle("The Creation of Adam");
      expect(await paintingAsset.painterName()).to.equal("Michelangelo");
      expect(await paintingAsset.paintingTitle()).to.equal("The Creation of Adam");
    });

    it("should prevent non-owners from updating painter name and painting title", async function () {
      await expect(paintingAsset.connect(addr1).updatePainterName("Vincent van Gogh")).to.be.revertedWith("Only the owner can change ownership");
      await expect(paintingAsset.connect(addr1).updatePaintingTitle("Starry Night")).to.be.revertedWith("Only the owner can change ownership");
    });

    it("should allow owner to change ownership", async function () {
      await paintingAsset.changeOwnership(addr1.address);
      expect(await paintingAsset.getAssetOwner()).to.equal(addr1.address);
    });

    it("should prevent non-owners from changing ownership", async function () {
      await expect(paintingAsset.connect(addr1).changeOwnership(addr2.address)).to.be.revertedWith("Only the owner can change ownership");
    });
  });

  describe("AudioAsset", function () {
    it("should deploy with correct attributes", async function () {
      expect(await audioAsset.trackName()).to.equal("Bohemian Rhapsody");
      expect(await audioAsset.vocalistName()).to.equal("Freddie Mercury");
      expect(await audioAsset.composerName()).to.equal("Queen");
      expect(await audioAsset.fetchDetails()).to.equal("Bohemian Rhapsody");
    });

    it("should allow owner to update track name, vocalist name, and composer name", async function () {
      await audioAsset.updateTrackName("Another One Bites the Dust");
      await audioAsset.updateVocalistName("John Deacon");
      await audioAsset.updateComposerName("Queen");
      expect(await audioAsset.trackName()).to.equal("Another One Bites the Dust");
      expect(await audioAsset.vocalistName()).to.equal("John Deacon");
      expect(await audioAsset.composerName()).to.equal("Queen");
    });

    it("should prevent non-owners from updating track name, vocalist name, and composer name", async function () {
      await expect(audioAsset.connect(addr1).updateTrackName("We Will Rock You")).to.be.revertedWith("Only the owner can change ownership");
      await expect(audioAsset.connect(addr1).updateVocalistName("Brian May")).to.be.revertedWith("Only the owner can change ownership");
      await expect(audioAsset.connect(addr1).updateComposerName("Queen")).to.be.revertedWith("Only the owner can change ownership");
    });

    it("should allow owner to change ownership", async function () {
      await audioAsset.changeOwnership(addr1.address);
      expect(await audioAsset.getAssetOwner()).to.equal(addr1.address);
    });

    it("should prevent non-owners from changing ownership", async function () {
      await expect(audioAsset.connect(addr1).changeOwnership(addr2.address)).to.be.revertedWith("Only the owner can change ownership");
    });
  });

  describe("AssetManufacturer", function () {
    it("should create and store deployed assets", async function () {
      await assetManufacturer.generateAsset(0, "Pablo Picasso", "Guernica", "", "", "");
      await assetManufacturer.generateAsset(1, "", "", "Imagine", "John Lennon", "John Lennon");

      const paintingAddress = await assetManufacturer.deployedAssets(0);
      const audioAddress = await assetManufacturer.deployedAssets(1);

      const paintingAssetFromFactory = await ethers.getContractAt("PaintingAsset", paintingAddress);
      const audioAssetFromFactory = await ethers.getContractAt("AudioAsset", audioAddress);

      expect(await paintingAssetFromFactory.painterName()).to.equal("Pablo Picasso");
      expect(await paintingAssetFromFactory.paintingTitle()).to.equal("Guernica");
      expect(await audioAssetFromFactory.trackName()).to.equal("Imagine");
      expect(await audioAssetFromFactory.vocalistName()).to.equal("John Lennon");
      expect(await audioAssetFromFactory.composerName()).to.equal("John Lennon");
    });
  });
});
