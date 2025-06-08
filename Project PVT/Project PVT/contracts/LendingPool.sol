// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Interface.sol";
import "hardhat/console.sol";

contract LendingPool {
    address public admin;
    uint256 public fee;
    uint256 public setFeeBalance;

    IPriceOracle public priceOracle;
    ICollateralManager public collateralManager;
    IInterestRate public interestRate;
    IBorrower public borrower;
    struct LenderAsset {
        uint256 amount;
        uint256 liquityIndex;
    }

    mapping(address => mapping(address => LenderAsset)) public lenderAssets;
    mapping(address => uint256) public totalassetSupplied;
    mapping(address => uint256) public totalassetCollateral;
    mapping(address => uint256) public assetBalance;

    event ContractAddress(
        address indexed priceOracle,
        address indexed collateralManager,
        address mockToken,
        address interestRate
    );
    event SetFee(uint256 setFeeBalance);
    event Deposit(address asset, uint256 amount, address indexed lender);
    event Borrow(address asset, uint256 amount, address indexed lender);
    event transfer(address asset, uint256 amount, address indexed lender);

    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    modifier onlyAuthorizedContracts() {
        require(msg.sender == address(borrower), "only authorized contracts");
        _;
    }
    constructor() {
        admin = msg.sender; // Gán admin là người triển khai contract
    }

    function setFee(uint256 _setFee) external onlyAdmin {
        fee = _setFee;
        emit SetFee(fee);
    }
    function setContractAddress(
        address _priceOracle,
        address _collateralManager,
        address _interestRate,
        address _borrower
    ) external onlyAdmin {
        priceOracle = IPriceOracle(_priceOracle);
        collateralManager = ICollateralManager(_collateralManager);
        interestRate = IInterestRate(_interestRate);
        borrower = IBorrower(_borrower);
        emit ContractAddress(
            _priceOracle,
            _collateralManager,
            _interestRate,
            _borrower
        );
    }
    function getAllValidCollateralTokens()
        external
        view
        returns (address[] memory)
    {
        return collateralManager.getAllValidCollateralTokens();
    }
    function isApprovedCollateral(address token) external view returns (bool) {
        return collateralManager.isApprovedCollateral(token);
    }
    function deposit(address assetAddress, uint256 amount) external payable {
        require(amount > 0, "The amount must be greater than zero");
        require(
            collateralManager.isApprovedCollateral(assetAddress),
            "Token is not allowed for deposit"
        );
        require(msg.value == fee, "Incorrect service fee amount");

        LenderAsset storage lenderAsset = lenderAssets[msg.sender][assetAddress];

        // Fetch the current liquidity index
        (uint256 liquidityIndex, , , ) = interestRate.getReserveData(assetAddress);

        // Adjust lender asset if previous deposit exists
        if (lenderAsset.amount > 0) {
            lenderAsset.amount = (lenderAsset.amount * liquidityIndex) / lenderAsset.liquityIndex;
        }

        // Update lender asset information
        lenderAsset.amount += amount;
        lenderAsset.liquityIndex = liquidityIndex;

        // Update contract-level balances
        assetBalance[assetAddress] += amount;
        totalassetSupplied[assetAddress] += amount;

        // Transfer tokens from the sender to the contract
        IERC20(assetAddress).transferFrom(msg.sender, address(this), amount);

        // Update interest rates
        interestRate.updateInterestRate(assetAddress);

        // Emit the deposit event
        emit Deposit(assetAddress, amount, msg.sender);
    }

    function withdraw(address asset, uint256 amount) external payable {
        require(amount > 0, "amount must be greater than 0");
        require(
            collateralManager.isApprovedCollateral(asset),
            "asset is not approved as collateral"
        );
        require(msg.value == fee, "send the correct amount of the fee set");
        LenderAsset storage lenderAsset = lenderAssets[msg.sender][asset];
        (uint256 liquityIndex, , , ) = interestRate.getReserveData(asset);
        if (lenderAsset.amount > 0) {
            lenderAsset.amount =
                (lenderAsset.amount * liquityIndex) /
                lenderAsset.liquityIndex;
            lenderAsset.amount -= amount;
            lenderAsset.liquityIndex = liquityIndex;
            assetBalance[asset] -= amount;
            totalassetSupplied[asset] -= amount;
            IERC20(asset).transfer(msg.sender, amount);
            emit transfer(asset, amount, msg.sender);
        }
    }
    function getCurrentUtilizationRate(
        address asset
    ) external view returns (uint256) {
        return
            (totalassetSupplied[asset] * 100) /
            (totalassetCollateral[asset] + totalassetSupplied[asset]);
    }
    function transferLoan(
        address asset,
        address user,
        uint256 amount
    ) external {
        require(
            collateralManager.isApprovedCollateral(asset),
            "asset is not approved as collateral"
        );
        require(
            assetBalance[asset] >= amount,
            "not enough balance"
        );
        assetBalance[asset] -= amount;
        lenderAssets[user][asset].amount += amount;
        emit transfer(asset, amount, user);
    }
    function transferExcessAmount(
        address asset,
        address user,
        uint256 amount
    ) external onlyAuthorizedContracts {
        IERC20(asset).transfer(user, amount);

        emit transfer(asset, amount, user);
    }

    function getTotalBalance(
        address asset
    ) external view returns (uint256, uint256) {
        LenderAsset storage lenderAsset = lenderAssets[msg.sender][asset];
        (uint256 liquityIndex, , , ) = interestRate.getReserveData(asset);
        uint256 totalBalance = (lenderAsset.amount * liquityIndex) /
            lenderAsset.liquityIndex;
        return (totalBalance, liquityIndex);
    }
   
    function withdrawServiceFee(uint256 amount) external onlyAdmin {
        require(
            setFeeBalance >= amount,
            "Insufficient service fee balance"
        );

        setFeeBalance -= amount;
        payable(admin).transfer(amount);
    }

    receive() external payable {
        setFeeBalance += msg.value;
    }
    function totalSupplied(address asset) external view returns (uint256) {
        return totalassetSupplied[asset];
    }

    
}
