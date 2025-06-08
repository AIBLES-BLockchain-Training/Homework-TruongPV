// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Interface.sol";
import "./PriceOracle.sol";
// import "hardhat/console.sol";

contract CollateralManager {
    struct CollateralAsset {
        uint256 amount;
        bool isLocked;
    }

    mapping(address => mapping(address => CollateralAsset))
        public collateralAssets;

    mapping(address => bool) public validCollateralTokens;
    mapping(address => bool) public pendingCollateralRequests; // Bản đồ lưu trữ yêu cầu tài sản thế chấp đang chờ phê duyệt
    address[] public validCollateralTokenList; // Mảng lưu trữ danh sách token hợp lệ

    address public admin;
    IPriceOracle public priceOracle;
    IMockToken public mockToken;
    ILendingPool public lendingPool;
    IBorrower public borrower;
    IInterestRate public interestRate;
    uint256 public addCollateralFee;
    uint256 public removeCollateralFee;
    uint256 public LTVLimit; // Tỷ lệ LTV tối đa cho khoản vay

    event CollateralAdded(
        address indexed user,
        address assetAddress,
        uint256 amount
    );
    event CollateralRemoved(
        address indexed user,
        address assetAddress,
        uint256 amount
    );
    event CollateralLocked(
        address indexed user,
        address assetAddress,
        bool isLocked
    );
    event CollateralUnlocked(
        address indexed user,
        address assetAddress,
        bool isLocked
    );
    event ContractAddressesUpdated(
        address indexed newPriceOracle,
        address indexed newMockToken,
        address newLendingPool,
        address newBorrower,
        address newInterestRate
    );
    event ValidCollateralTokenUpdated(address indexed token, bool isValid);
    event FeesUpdated(uint256 addCollateralFee, uint256 removeCollateralFee);
    event LoanRequested(
        address indexed borrower,
        uint256 loanAmount,
        address indexed collateralAsset,
        uint256 collateralAmount
    );
    event LoanApproved(
        address indexed borrower,
        uint256 loanAmount,
        address indexed collateralAsset,
        uint256 collateralAmount
    );
    event LoanRejected(address indexed borrower);
    event CollateralRequestSubmitted(address indexed token);
    event CollateralRequestApproved(address indexed token);
    event CollateralRequestRejected(address indexed token);
    event LTVLimitUpdated(uint256 newLTVLimit);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender; // Chỉ gán admin là người tạo hợp đồng
    }

    // Update MockToken and PriceOracle addresses
    function setContractAddresses(
        address _priceOracle,
        address _mockToken,
        address _lendingPool,
        address _borrower,
        address _interestRate
    ) external onlyAdmin {
        priceOracle = IPriceOracle(_priceOracle);
        mockToken = IMockToken(_mockToken);
        lendingPool = ILendingPool(_lendingPool);
        borrower = IBorrower(_borrower);
        interestRate = IInterestRate(_interestRate);

        emit ContractAddressesUpdated(
            _priceOracle,
            _mockToken,
            _lendingPool,
            _borrower,
            _interestRate
        );
    }
    function setFees(
        uint256 _addCollateralFee,
        uint256 _removeCollateralFee
    ) external onlyAdmin {
        addCollateralFee = _addCollateralFee;
        removeCollateralFee = _removeCollateralFee;
        emit FeesUpdated(_addCollateralFee, _removeCollateralFee);
    }
    function setLTVLimit(uint256 _LTVLimit) external onlyAdmin {
        LTVLimit = _LTVLimit;
        emit LTVLimitUpdated(_LTVLimit);
    }
    function submitCollateralRequest(address token) external onlyAdmin {
        require(token != address(0), "Invalid token address");
        require(!pendingCollateralRequests[token], "Request already pending");
        require(!validCollateralTokens[token], "Token is already valid"); // Check if token is valid

        pendingCollateralRequests[token] = true; // Mark the request as pending
        emit CollateralRequestSubmitted(token);
    }

    function approveCollateralRequest(address token) external onlyAdmin {
        require(pendingCollateralRequests[token], "No pending request found");

        pendingCollateralRequests[token] = false; // Xóa yêu cầu
        validCollateralTokens[token] = true; // Cập nhật trạng thái phê duyệt cho tài sản này
        validCollateralTokenList.push(token); // Thêm vào danh sách token hợp lệ
        emit CollateralRequestApproved(token);
    }

    function isApprovedCollateral(address token) public view returns (bool) {
        return validCollateralTokens[token]; // Trả về true nếu tài sản đã được phê duyệt
    }

    function rejectCollateralRequest(address token) external onlyAdmin {
        require(pendingCollateralRequests[token], "No pending request found");
        pendingCollateralRequests[token] = false; // Xóa yêu cầu
        emit CollateralRequestRejected(token);
    }
    function getAllValidCollateralTokens()
        external
        view
        returns (address[] memory)
    {
        return validCollateralTokenList; // Trả về danh sách tài sản thế chấp hợp lệ
    }

    function addCollateral(
        address assetAddress,
        uint256 amount
    ) external payable {
        require(validCollateralTokens[assetAddress], "Invalid asset");
        require(amount > 0, "Amount must be greater than 0");
        require(
            !collateralAssets[msg.sender][assetAddress].isLocked,
            "Collateral is locked"
        );
        require(msg.value == addCollateralFee, "Invalid fee amount");
        if (collateralAssets[msg.sender][assetAddress].amount == 0) {
            validCollateralTokenList.push(assetAddress);
        }
        CollateralAsset storage asset = collateralAssets[msg.sender][
            assetAddress
        ];
        asset.amount += amount;
        (bool success, ) = address(lendingPool).call{value: addCollateralFee}(
            ""
        );
        require(success, "Transfer failed");
        IERC20(assetAddress).transferFrom(msg.sender, address(this), amount);
        emit CollateralAdded(msg.sender, assetAddress, amount);
    }
    function removeCollateral(
        address assetAddress,
        uint256 amount
    ) external payable {
        require(validCollateralTokens[assetAddress], "Invalid asset");
        require(amount > 0, "Amount must be greater than 0");
        require(
            !collateralAssets[msg.sender][assetAddress].isLocked,
            "Collateral is locked"
        );

        CollateralAsset storage asset = collateralAssets[msg.sender][
            assetAddress
        ];
        require(asset.amount >= amount, "Insufficient collateral amount");
        require(msg.value == removeCollateralFee, "Invalid fee amount");

        asset.amount -= amount;
        (bool success, ) = address(lendingPool).call{
            value: removeCollateralFee
        }("");
        require(success, "Transfer failed");
        IERC20(assetAddress).transfer(msg.sender, amount);
        emit CollateralRemoved(msg.sender, assetAddress, amount);
    }
    function lockCollateral(
        address user,
        address assetAddress
    ) external {
        collateralAssets[user][assetAddress].isLocked = true;
        emit CollateralLocked(user, assetAddress, true);
    }
    function unlockCollateral(
        address user,
        address assetAddress
    ) external {
        collateralAssets[user][assetAddress].isLocked = false;
        emit CollateralUnlocked(user, assetAddress, false);
    }

    function getValidCollateralTokens()
        external
        view
        returns (address[] memory)
    {
        return validCollateralTokenList;
    }

    function getCollateralAmount(
        address user,
        address assetAddress
    ) external view returns (uint256) {
        return collateralAssets[user][assetAddress].amount;
    }
    function isCollateralLocked(
        address user,
        address assetAddress
    ) external view returns (bool) {
        return collateralAssets[user][assetAddress].isLocked;
    }
    function getTotalCollateralValue(
        address user,
        address[] calldata assetAddresses
    ) external view returns (uint256) {
        uint256 totalValue = 0;
        for (uint256 i = 0; i < assetAddresses.length; i++) {
            address asset = assetAddresses[i];
            if (isApprovedCollateral(asset)) {
                uint256 price = priceOracle.getAssetPrice(asset);
                uint256 collateralValue = (price *
                    collateralAssets[user][asset].amount) / 1e18;
                totalValue += collateralValue;
            }
        }
        return totalValue;
    }
    function getAssetPrice(address asset) public view returns (uint256) {
        return priceOracle.getAssetPrice(asset);
    }
}
