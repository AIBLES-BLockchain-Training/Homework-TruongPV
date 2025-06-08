// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPriceOracle {
    event PriceOracleSet(address indexed asset, address indexed priceOracle);
    event CustomPriceSet(address indexed asset, uint256 price);
    event PriceUpdated(address indexed asset, uint256 price);

    function admin() external view returns (address);

    function priceOracles(address asset) external view returns (address);

    function CustomPrice(address asset) external view returns (uint256);

    function setPriceOracle(address asset, address priceOracle) external;

    function setCustomPrice(address asset, uint256 price) external;

    function getAssetPrice(address asset) external view returns (uint256);

    function resetAssetPrice(address asset) external;
}

interface IInterestRate {
    // Structs
    struct InterestParams {
        uint256 slope1;
        uint256 slope2;
        uint256 baseRate;
        uint256 optimal;
    }

    struct ReserveData {
        uint256 liquidityIndex;
        uint256 variableBorrowIndex;
        uint256 currentLiquidityRate;
        uint256 currentVariableBorrowRate;
        uint256 lastUpdateTimestamp;
    }

    // Events
    event SetContractAddress(
        address indexed _lendingPool,
        address indexed _borrower
    );

    event InterestParamsSet(
        address indexed _assetaddress,
        uint256 _slope1,
        uint256 _slope2,
        uint256 _baseRate,
        uint256 _optimal
    );

    event ReserveDataUpdated(
        address indexed _assetaddress,
        uint256 _liquidityIndex,
        uint256 _variableBorrowIndex,
        uint256 _currentLiquidityRate,
        uint256 _currentVariableBorrowRate,
        uint256 _lastUpdateTimestamp
    );

    event ReserveInitialized(
        address indexed _assetaddress,
        uint256 _liquidityIndex,
        uint256 _variableBorrowIndex,
        uint256 _currentLiquidityRate,
        uint256 _currentVariableBorrowRate,
        uint256 _lastUpdateTimestamp
    );

    // Admin-only functions
    function setContractAddress(
        address _lendingPool,
        address _borrower
    ) external;

    function setInterestParams(
        address _assetaddress,
        uint256 _slope1,
        uint256 _slope2,
        uint256 _baseRate,
        uint256 _optimal
    ) external;

    // View functions
    function getInterestRateParmas(
        address _assetaddress
    )
        external
        view
        returns (
            uint256 slope1,
            uint256 slope2,
            uint256 baseRate,
            uint256 optimal
        );

    function calculateBorrowAPR(
        address _assetaddress
    ) external  view returns (uint256 borrowAPR);

    function calculateBorrowAPY(
        address tokenAddress
    ) external view returns (uint256 borrowAPY);

    function getReserveData(
        address tokenAddress
    )
        external
        view
        returns (
            uint256 liquidityIndex,
            uint256 variableBorrowIndex,
            uint256 currentLiquidityRate,
            uint256 currentVariableBorrowRate
        );

    // Authorized-only functions
    function updateInterestRate(address asset) external;

    function setInterestRateParams(
        address _tokenAddress,
        uint256 _slope1,
        uint256 _slope2,
        uint256 _baseRate,
        uint256 _utilizationOptimal
    ) external;
}
interface ILendingPool {
    // Các sự kiện
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

    // Các hàm public
    function setFee(uint256 _setFee) external;
    function setContractAddress(
        address _priceOracle,
        address _collateralManager,
        address _interestRate,
        address _borrower
    ) external;
    function getAllValidCollateralTokens()
        external
        view
        returns (address[] memory);
    function isApprovedCollateral(address token) external view returns (bool);
    function deposit(address assetAddress, uint256 amount) external payable;
    function withdraw(address asset, uint256 amount) external payable;
    function getCurrentUtilizationRate(
        address asset
    ) external view returns (uint256);
    function transferLoan(address asset, address user, uint256 amount) external;
    function transferExcessAmount(
        address asset,
        address user,
        uint256 amount
    ) external;
    function getTotalBalance(
        address asset
    ) external view returns (uint256, uint256);
    function withdrawServiceFee(uint256 amount) external;
    function totalSupplied(address asset) external view returns (uint256);
    function setRejectTransfers(bool _rejectTransfers) external;
    function rejectTransfers() external view returns (bool);
    function depositAsset(address assetAddress, uint256 amount) external payable;
    function setServiceFee(uint256 _serviceFee) external;
}
interface IBorrower {
    struct Loan {
        uint256 id;
        address borrower;
        address assetAdddress;
        uint256 assetAmount;
        address[] collateralAddresses;
        uint256 variableBorrowIndex;
    }

    struct RickParams {
        uint256 liquidationThreshold;
        uint256 ltv;
    }

    // Events
    event SetContractAddress(
        address indexed _lendingPool,
        address indexed _interestRate,
        address indexed _priceOracle,
        address _collateralManager
    );
    event setFeeEvent(uint256 _setFee);
    event RickParamsSet(
        address indexed _assetaddress,
        uint256 _liquidationThreshold,
        uint256 _ltv
    );
    event LoanCreated(
        uint256 indexed _id,
        address indexed _borrower,
        address indexed _assetAdddress,
        uint256 _assetAmount,
        address[] _collateralAddresses
    );
    event LoanRepayed(
        uint256 indexed _id,
        address indexed _borrower,
        uint256 _assetAmount
    );
    event LoanRemoveId(uint256 indexed _id);
    event LoanIdRemovedFromGlobalList(uint256 indexed loanId);
    event LoanIdRemovedFromBorrower(
        address indexed user,
        uint256 indexed loanId
    );
    event LoanLiquidated(
        uint256 indexed _id,
        address indexed _borrower,
        uint256 _assetAmount
    );

    // External/Public Functions
    function setContractAddress(
        address _lendingPool,
        address _interestRate,
        address _priceOracle,
        address _collateralManager
    ) external;

    function setFee(uint256 _fee) external;

    function setRickParams(
        address _assetaddress,
        uint256 _liquidationThreshold,
        uint256 _ltv
    ) external;

    function createLoan(
        address _assetAdddress,
        uint256 _assetAmount,
        address[] calldata _collateralAddresses
    ) external payable;

    function calculateTotalRepayment(
        uint256 _id
    ) external view returns (uint256, uint256);

    function repayLoan(uint256 _id, uint256 _amount) external payable;

    function getCurrentVariableBorrowRate(
        address _assetaddress
    ) external view returns (uint256);

    function getLoanHealthFactor(
        uint256 _loanId
    ) external view returns (uint256);

    function getAllloanIds() external view returns (uint256[] memory);

    function checkUpkeep(
        bytes calldata
    ) external view returns (bool upkeepNeeded, bytes memory performData);

    function performUpkeep(bytes calldata performData) external;

    function liquidateLoan(uint256 _loanId) external ;

}
interface IMockToken {
    // Event declaration
    event Mint(address indexed to, uint256 amount);

    // Functions in the MockToken contract
    function mint(address to, uint256 amount) external;
}
interface ICollateralManager {
    struct CollateralAsset {
        uint256 amount;
        bool isLocked;
    }

    // Các hàm chỉ Admin
    function setContractAddresses(
        address _priceOracle,
        address _mockToken
    ) external;
    function setFees(
        uint256 _addCollateralFee,
        uint256 _removeCollateralFee
    ) external;
    function setLTVLimit(uint256 _LTVLimit) external;
    function submitCollateralRequest(address token) external;
    function approveCollateralRequest(address token) external;
    function rejectCollateralRequest(address token) external;
    function updateValidCollateralTokens(
        address[] calldata tokens,
        bool[] calldata status
    ) external;

    // Các hàm công khai
    function isApprovedCollateral(address token) external view returns (bool);
    function getAllValidCollateralTokens()
        external
        view
        returns (address[] memory);
    function getValidCollateralTokens()
        external
        view
        returns (address[] memory);
    function getCollateralAmount(
        address user,
        address assetAddress
    ) external view returns (uint256);
    function isCollateralLocked(
        address user,
        address assetAddress
    ) external view returns (bool);
    function getTotalCollateralValue(
        address user,
        address[] calldata assetAddresses
    ) external view returns (uint256);
    function getCollateralValueForTokens(
        address user,
        address[] calldata tokens
    ) external view returns (uint256);

    // Các hàm thêm/loại bỏ tài sản thế chấp
    function addCollateral(address assetAddress, uint256 amount) external;
    function removeCollateral(address assetAddress, uint256 amount) external;

    // Các hàm khóa/mở khóa tài sản thế chấp
    function lockCollateral(address user, address assetAddress) external;
    function unlockCollateral(address user, address assetAddress) external;

    function lockCollaterals(
        address user,
        address[] calldata collateralAddresses
    ) external;

    function unlockCollaterals(
        address user,
        address[] calldata collateralAddresses
    ) external;

    function transferCollateral(
        address collateralAddress,
        uint256 amount
    ) external;

    function setAllowedToken(address[] calldata tokens) external;
}
