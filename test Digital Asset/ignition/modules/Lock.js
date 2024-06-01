const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AssetModule", (m) => {
    // Define contracts with arguments
    const paintingAsset = m.contract("PaintingAsset", ["Vincent van Gogh", "Starry Night"]);
    const audioAsset = m.contract("AudioAsset", ["Imagine", "John Lennon", "John Lennon"]);

    // Assuming AssetManufacturer requires no constructor arguments
    const assetManufacturer = m.contract("AssetManufacturer", []);

    return { paintingAsset, audioAsset, assetManufacturer };
});
