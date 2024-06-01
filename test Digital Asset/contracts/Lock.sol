// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAssetDetails {
    function fetchDetails() external view returns (string memory);
    function changeOwnership(address newOwner) external;
}

abstract contract BaseAsset is IAssetDetails {
    string internal assetName;
    address internal assetOwner;

    constructor(string memory _assetName) {
        assetName = _assetName;
        assetOwner = msg.sender;
    }

    function fetchDetails() public view virtual override returns (string memory) {
        return assetName;
    }

    function changeOwnership(address newOwner) public virtual override;

    function getAssetOwner() public view returns (address) {
        return assetOwner;
    }
}

contract PaintingAsset is BaseAsset {
    string public painterName;
    string public paintingTitle;

    constructor(string memory _painterName, string memory _paintingTitle) BaseAsset(_paintingTitle) {
        painterName = _painterName;
        paintingTitle = _paintingTitle;
    }

    modifier onlyAssetOwner() {
        require(msg.sender == assetOwner, "Only the owner can change ownership");
        _;
    }

    function updatePainterName(string memory _painterName) public onlyAssetOwner {
        painterName = _painterName;
    }

    function updatePaintingTitle(string memory _paintingTitle) public onlyAssetOwner {
        paintingTitle = _paintingTitle;
    }

    function changeOwnership(address newOwner) public virtual override onlyAssetOwner {
        assetOwner = newOwner;
    }
}

contract AudioAsset is BaseAsset {
    string public trackName;
    string public vocalistName;
    string public composerName;

    constructor(string memory _trackName, string memory _vocalistName, string memory _composerName) BaseAsset(_trackName) {
        trackName = _trackName;
        vocalistName = _vocalistName;
        composerName = _composerName;
    }

    modifier onlyAssetOwner() {
        require(msg.sender == assetOwner, "Only the owner can change ownership");
        _;
    }

    function updateTrackName(string memory _trackName) public onlyAssetOwner {
        trackName = _trackName;
    }

    function updateVocalistName(string memory _vocalistName) public onlyAssetOwner {
        vocalistName = _vocalistName;
    }

    function updateComposerName(string memory _composerName) public onlyAssetOwner {
        composerName = _composerName;
    }

    function changeOwnership(address newOwner) public virtual override onlyAssetOwner {
        assetOwner = newOwner;
    }
}

contract AssetManufacturer {
    enum AssetCategory { Painting, Music }
    address[] public deployedAssets;

    function generateAsset(AssetCategory assetCategory, string memory _painterName, string memory _paintingTitle, string memory _trackName, string memory _vocalistName, string memory _composerName) external {
        if (assetCategory == AssetCategory.Painting) {
            PaintingAsset newAsset = new PaintingAsset(_painterName, _paintingTitle);
            deployedAssets.push(address(newAsset));
        } else if (assetCategory == AssetCategory.Music) {
            AudioAsset newAsset = new AudioAsset(_trackName, _vocalistName, _composerName);
            deployedAssets.push(address(newAsset));
        } else {
            revert("Unsupported asset category");
        }
    }
}
