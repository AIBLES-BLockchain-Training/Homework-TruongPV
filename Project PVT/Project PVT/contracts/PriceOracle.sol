// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import Chainlink Aggregator Interface
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceOracle {
    address public admin;

    mapping(address => address) public priceOracles;
    mapping(address => uint256) public CustomPrice;

    event PriceOracleSet(address indexed asset, address indexed priceOracle);
    event CustomPriceSet(address indexed asset, uint256 price);
    event PriceUpdated(address indexed asset, uint256 price);

    modifier onlyAdmin() {
        require(msg.sender == admin, "PriceOracle: Only admin");
        _;
    }
    constructor() {
        admin = msg.sender;
    }
    function setPriceOracle(
        address asset,
        address priceOracle
    ) external onlyAdmin {
        priceOracles[asset] = priceOracle;
        emit PriceOracleSet(asset, priceOracle);
    }
    function setCustomPrice(address asset, uint256 price) external onlyAdmin {
        CustomPrice[asset] = price;
        emit CustomPriceSet(asset, price);
    }
    function getAssetPrice(address asset) public view returns (uint256) {
        if (CustomPrice[asset] != 0) {
            return CustomPrice[asset];
        }
        if (priceOracles[asset] != address(0)) {
            return getPriceFromChainlink(priceOracles[asset]);
        }
        revert("No price available");
    }
    function resetAssetPrice(address asset) external onlyAdmin {
        CustomPrice[asset] = 0;
        emit CustomPriceSet(asset, 0);
    }
    function getPriceFromChainlink(
        address priceOracle
    ) internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceOracle);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "PriceOracle: Invalid price");
        return uint256(price);
    }
}
