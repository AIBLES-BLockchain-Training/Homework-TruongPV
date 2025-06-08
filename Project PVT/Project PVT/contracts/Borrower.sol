// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/automation/KeeperCompatible.sol";
import "hardhat/console.sol";

contract Borrower is KeeperCompatibleInterface {
    address public admin;
    uint256 decimal = 10000;
    ILendingPool public lendingPool;
    IInterestRate public interestRate;
    IPriceOracle public priceOracle;
    ICollateralManager public collateralManager;

    uint256 public loanCount;
    uint256 public fee;
    uint256[] public loanIds;

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
    mapping(uint256 => Loan) public loans;
    mapping(address => RickParams) public rickParams;
    mapping(address => uint256[]) public borrowerLoans;

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
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin can call this function");
        _;
    }
    constructor() {
        admin = msg.sender;
        loanCount = 0;
    }
    function setContractAddress(
        address _lendingPool,
        address _interestRate,
        address _priceOracle,
        address _collateralManager
    ) external onlyAdmin {
        lendingPool = ILendingPool(_lendingPool);
        interestRate = IInterestRate(_interestRate);
        priceOracle = IPriceOracle(_priceOracle);
        collateralManager = ICollateralManager(_collateralManager);
        emit SetContractAddress(
            _lendingPool,
            _interestRate,
            _priceOracle,
            _collateralManager
        );
    }
    function setFee(uint256 _fee) external onlyAdmin {
        fee = _fee;
        emit setFeeEvent(_fee);
    }
    function setRickParams(
        address _assetaddress,
        uint256 _liquidationThreshold,
        uint256 _ltv
    ) external onlyAdmin {
        require(
            _ltv < _liquidationThreshold,
            "LTV should be less than liquidation threshold"
        );
        rickParams[_assetaddress] = RickParams({
            liquidationThreshold: _liquidationThreshold,
            ltv: _ltv
        });
        emit RickParamsSet(_assetaddress, _liquidationThreshold, _ltv);
    }
    function createLoan(
        address _assetAdddress,
        uint256 _assetAmount,
        address[] calldata _collateralAddresses
    ) external payable {
        require(msg.value == fee, "Fee is not paid");

        require(
            !collateralManager.isCollateralLocked(msg.sender, _assetAdddress),
            "Collateral is locked"
        );
        require(
            _collateralAddresses.length > 0,
            "Collateral Addresses should be greater than 0"
        );
        uint256 totalCollateralValue = collateralManager  
        .getTotalCollateralValue(
            msg.sender,
            _collateralAddresses
        );
        uint256 maxLoanAmount = (totalCollateralValue *
            rickParams[_assetAdddress].ltv) / decimal;
        uint256 tokenPrice = priceOracle.getAssetPrice(_assetAdddress);
        uint256 maxLoanAmountInUSD = (maxLoanAmount / tokenPrice) * 1e18;
        require(
            _assetAmount > 0 && _assetAmount <= maxLoanAmountInUSD,
            "Invalid asset amount"
        );
        loanCount++;
        uint256 loanId = loanCount;
        (, uint256 currentVariableBorrowIndex, , ) = interestRate
            .getReserveData(_assetAdddress);
        for (uint256 i = 0; i < _collateralAddresses.length; i++) {
            collateralManager.lockCollateral(
                msg.sender,
                _collateralAddresses[i]
            );
        }
        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            assetAdddress: _assetAdddress,
            assetAmount: _assetAmount,
            collateralAddresses: _collateralAddresses,
            variableBorrowIndex: currentVariableBorrowIndex
        });
        borrowerLoans[msg.sender].push(loanId);
        loanIds.push(loanId);
        lendingPool.transferLoan(_assetAdddress, msg.sender, _assetAmount);
        (bool success, ) = address(lendingPool).call{value: fee}("");
        require(success, "Transfer failed");
        interestRate.updateInterestRate(_assetAdddress);
        emit LoanCreated(
            loanId,
            msg.sender,
            _assetAdddress,
            _assetAmount,
            _collateralAddresses
        );
    }
    function calculateTotalRepayment(
        uint256 _id
    ) public view returns (uint256, uint256) {
        Loan storage loan = loans[_id];
        uint256 totalRepayment = (loan.assetAmount *
            rickParams[loan.assetAdddress].ltv) / decimal;
        uint256 currentVariableBorrowIndex = loan.variableBorrowIndex;
        return (totalRepayment, currentVariableBorrowIndex);
    }
    function removeLoanIdFromBorrower(address user, uint256 loanId) internal {
        uint256[] storage userLoanIds = borrowerLoans[user];
        for (uint256 i = 0; i < userLoanIds.length; i++) {
            if (userLoanIds[i] == loanId) {
                userLoanIds[i] = userLoanIds[userLoanIds.length - 1];
                userLoanIds.pop();

                emit LoanIdRemovedFromBorrower(user, loanId);
                break;
            }
        }
    }

    function removeLoanIdFromGlobalList(uint256 loanId) internal {
        for (uint256 i = 0; i < loanIds.length; i++) {
            if (loanIds[i] == loanId) {
                loanIds[i] = loanIds[loanIds.length - 1];
                loanIds.pop();

                emit LoanIdRemovedFromGlobalList(loanId);
                break;
            }
        }
    }

    function repayLoan(uint256 _id, uint256 _amount) external payable {
        require(msg.value == fee, "Fee is not paid");
        Loan storage loan = loans[_id];
        require(loan.borrower == msg.sender, "Invalid borrower");
        require(_amount > 0, "Invalid amount");
        (
            uint256 totalRepayment,
            uint256 currentVariableBorrowIndex
        ) = calculateTotalRepayment(_id);
        loan.assetAmount = totalRepayment;
        if (_amount < totalRepayment) {
            loan.assetAmount -= _amount;
            loan.variableBorrowIndex = currentVariableBorrowIndex;

            IERC20(loan.assetAdddress).transferFrom(
                msg.sender,
                address(lendingPool),
                _amount
            );
            (bool success, ) = address(lendingPool).call{value: fee}("");
            require(success, "Transfer failed");
        } else {
            uint256 excessAmount = _amount - totalRepayment;
            loan.assetAmount = 0;

            IERC20(loan.assetAdddress).transferFrom(
                msg.sender,
                address(lendingPool),
                totalRepayment
            );
            (bool success, ) = address(lendingPool).call{value: fee}("");
            require(success, "Transfer failed");
            if (excessAmount > 0) {
                lendingPool.transferExcessAmount(
                    loan.assetAdddress,
                    msg.sender,
                    excessAmount
                );
            }
            collateralManager.unlockCollateral(msg.sender, loan.assetAdddress);
            removeLoanIdFromBorrower(msg.sender, _id);
            removeLoanIdFromGlobalList(_id);
        }
        interestRate.updateInterestRate(loan.assetAdddress);
        emit LoanRepayed(_id, msg.sender, _amount);
    }
    function getCurrentVariableBorrowRate(
        address _assetaddress
    ) external view returns (uint256) {
        (, , uint256 currentVariableBorrowRate, ) = interestRate.getReserveData(
            _assetaddress
        );
        return currentVariableBorrowRate;
    }

    function getLoanHealthFactor(
        uint256 _loanId
    ) public view returns (uint256) {
        Loan memory loan = loans[_loanId];
        uint256 totalCollateralValue = collateralManager
            .getTotalCollateralValue(loan.borrower, loan.collateralAddresses);
        uint256 assetPrice = priceOracle.getAssetPrice(loan.assetAdddress);
        (uint256 totalLoanAmount, ) = calculateTotalRepayment(_loanId);
        uint256 loanAmountInUSD = (totalLoanAmount * assetPrice) / 1e18;
        uint256 liquidationThreshold = rickParams[loan.assetAdddress]
            .liquidationThreshold;

        require(loanAmountInUSD > 0, "Loan amount in USD must be greater than 0");
        
        uint256 healthFactor = (totalCollateralValue * liquidationThreshold) / 
            (loanAmountInUSD * decimal);
            
        return healthFactor;
    }

    function getAllloanIds() public view returns (uint256[] memory) {
        return loanIds;
    }
    function liquidateLoan(uint256 _loanId) internal {
        Loan storage loan = loans[_loanId];
        require(loan.borrower != address(0), "Invalid loan id");
        require(
            getLoanHealthFactor(_loanId) <= 1,
            "Loan health factor is greater than 1"
        );
        uint256 totalCollateralValue = collateralManager
            .getTotalCollateralValue(loan.borrower, loan.collateralAddresses);
        uint256 assetPrice = priceOracle.getAssetPrice(loan.assetAdddress);
        (uint256 totalLoanAmount, ) = calculateTotalRepayment(_loanId);
        uint256 loanAmountInUSD = (totalLoanAmount * assetPrice) / 1e18;
        uint256 liquidationThreshold = rickParams[loan.assetAdddress].liquidationThreshold;
        
        // Tính toán giá trị thực tế có thể thanh lý (đưa về cùng đơn vị với loanAmountInUSD)
        uint256 actualCollateralValue = (totalCollateralValue * liquidationThreshold * assetPrice) / (decimal * 1e18);
        
        require(
            actualCollateralValue <= loanAmountInUSD,
            "Collateral value is greater than loan value"
        );
        
        uint256 liquidationAmount = totalLoanAmount;
        IERC20(loan.assetAdddress).transferFrom(
            msg.sender,
            address(lendingPool),
            liquidationAmount
        );
        (bool success, ) = address(lendingPool).call{value: fee}("");
        collateralManager.unlockCollateral(loan.borrower, loan.assetAdddress);
        removeLoanIdFromBorrower(loan.borrower, _loanId);
        removeLoanIdFromGlobalList(_loanId);
        emit LoanLiquidated(_loanId, loan.borrower, liquidationAmount);
    }
    function checkUpkeep(
        bytes calldata
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint256[] memory allLoanIds = getAllloanIds();
        uint256 maxLoanIdsToCheck = 5;
        uint256[] memory loanIdsToCheck = new uint256[](maxLoanIdsToCheck);
        uint256 count = 0;
        for (
            uint256 i = 0;
            i < allLoanIds.length && count < maxLoanIdsToCheck;
            i++
        ) {
            if (getLoanHealthFactor(allLoanIds[i]) <= 1) {
                loanIdsToCheck[count] = allLoanIds[i];
                count++;
            }
        }
        if (count > 0) {
            upkeepNeeded = true;
            performData = abi.encode(loanIdsToCheck, count);
        } else {
            performData = "";
        }
    }
    function performUpkeep(bytes calldata performData) external override {
        uint256[] memory loanIdsToCheck = abi.decode(performData, (uint256[]));
        for (uint256 i = 0; i < loanIdsToCheck.length; i++) {
            liquidateLoan(loanIdsToCheck[i]);
        }
    }
   
}
