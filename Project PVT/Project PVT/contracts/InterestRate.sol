// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Interface.sol";

contract InterestRate {
    address public admin;
    uint256 constant decimal = 10000; // xác định decimal là 10000 để tính toán

    ILendingPool public LendingPool;
    IBorrower public borrower;

    struct InterestParams {
        uint256 slope1;
        uint256 slope2;
        uint256 baseRate;
        uint256 utilizationOptimal;
    } // lưu trữ thông số của interest rate cho từng loại token

    struct ReserveData {
        uint256 liquidityIndex;
        uint256 variableBorrowIndex;
        uint256 currentLiquidityRate;
        uint256 currentVariableBorrowRate;
        uint256 lastUpdateTimestamp;
    } // lưu trữ thông tin của 1 loại token trong hệ thống

    mapping(address => InterestParams) public interestParams;

    mapping(address => ReserveData) public reserves; // lưu trữ thông tin của 1 loại token trong hệ thống

    event SetContractAddress(
        address indexed lendingPool,
        address indexed borrower
    );
    event InterestParamsSet(
        address indexed tokenAddress,
        uint256 slope1,
        uint256 slope2,
        uint256 baseRate,
        uint256 _utilizationOptimal
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
        address indexed tokenAddress,
        uint256 currentLiquidityRate,
        uint256 currentVariableBorrowRate,
        uint256 liquidityIndex,
        uint256 variableBorrowIndex,
        uint256 lastUpdateTimestamp
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    modifier onlyAuthorizedContracts() {
        require(
            msg.sender == address(LendingPool) ||
                msg.sender == address(borrower),
            "Only authorized contracts can call this function"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function setContractAddress(
        address _lendingPool,
        address _borrower
    ) external onlyAdmin {
        LendingPool = ILendingPool(_lendingPool);
        borrower = IBorrower(_borrower);
        emit SetContractAddress(_lendingPool, _borrower);
    }

    function setInterestParams(
        address _tokenAddress,
        uint256 _slope1,
        uint256 _slope2,
        uint256 _baseRate,
        uint256 _utilizationOptimal
    ) external onlyAdmin {
        interestParams[_tokenAddress] = InterestParams(
            _slope1,
            _slope2,
            _baseRate,
            _utilizationOptimal
        );
        emit InterestParamsSet(
            _tokenAddress,
            _slope1,
            _slope2,
            _baseRate,
            _utilizationOptimal
        );
    } // thiết lập thông số lãi xuất

    function getInterestRateParmas(
        address _tokenAddress
    ) external view returns (uint256, uint256, uint256, uint256) {
        InterestParams storage interestParmas = interestParams[_tokenAddress];
        return (
            interestParmas.slope1,
            interestParmas.slope2,
            interestParmas.baseRate,
            interestParmas.utilizationOptimal
        );
    } // lấy thông số lãi xuất

    function initializeReserve(address _tokenAddress) external onlyAdmin {
        reserves[_tokenAddress] = ReserveData({
            currentLiquidityRate: 1 * decimal,
            currentVariableBorrowRate: 1 * decimal,
            liquidityIndex: 1 * 1e18,
            variableBorrowIndex: 1 * 1e18,
            lastUpdateTimestamp: block.timestamp
        });
        emit ReserveInitialized(
            _tokenAddress,
            1 * decimal,
            1 * decimal,
            1 * 1e18,
            1 * 1e18,
            block.timestamp
        );
    } // khởi tạo thông tin của 1 loại token

    function calculateBorrowAPR(
        address _tokenAddress
    ) public view returns (uint256) {
        uint256 utilizationRate = LendingPool.getCurrentUtilizationRate(
            _tokenAddress
        );
        InterestParams memory interestParmas = interestParams[_tokenAddress];
        uint256 borrowAPR;

        if (utilizationRate <= interestParmas.utilizationOptimal) {
            borrowAPR =
                interestParmas.baseRate +
                (utilizationRate * interestParmas.slope1) /
                interestParmas.utilizationOptimal;
        } else {
            uint256 excessUtilization = utilizationRate -
                interestParmas.utilizationOptimal;
            borrowAPR =
                interestParmas.baseRate +
                interestParmas.slope1 +
                (excessUtilization * interestParmas.slope2) /
                (1 * decimal - interestParmas.utilizationOptimal);
        }
        return borrowAPR;
    } // hàm tính lãi xuất

    function calculateBorrowAPY(
        address _tokenAddress
    ) public view returns (uint256) {
        uint256 rate = (calculateBorrowAPR(_tokenAddress) * 1e27) / decimal;
        uint256 SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

        uint256 exMinusOne;
        uint256 exMinusTwo;
        uint256 basePowerTwo;
        uint256 basePowerThree;

        unchecked {
            exMinusOne = SECONDS_PER_YEAR - 1;
            exMinusTwo = SECONDS_PER_YEAR - 2;
            basePowerTwo = (rate * rate + (1e27 / 2)) / 1e27;
            basePowerThree =
                (basePowerTwo * rate + (1e27 / 2)) /
                1e27 /
                SECONDS_PER_YEAR;
        }
        uint256 secondTerm = SECONDS_PER_YEAR * exMinusOne * basePowerTwo;
        unchecked {
            secondTerm /= 2;
        }
        uint256 thirdTerm = SECONDS_PER_YEAR * exMinusTwo * basePowerThree;
        unchecked {
            thirdTerm /= 6;
        }
        return
            (((1e27 +
                (rate * SECONDS_PER_YEAR) /
                SECONDS_PER_YEAR +
                secondTerm +
                thirdTerm) - 1e27) * decimal) / 1e27;
    } // hàm tính lãi xuất hàng năm

    function updateInterestRate(
        address _tokenAddress
    ) external onlyAuthorizedContracts {
        ReserveData storage reserve = reserves[_tokenAddress];

        uint256 SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
        uint256 timeElapsed = block.timestamp - reserve.lastUpdateTimestamp;

        uint256 borrowAPY = calculateBorrowAPY(_tokenAddress);
        uint256 liquidityRate = calculateBorrowAPY(_tokenAddress);

        reserve.currentLiquidityRate = liquidityRate;
        reserve.currentVariableBorrowRate = borrowAPY;

        unchecked {
            reserve.liquidityIndex =
                (reserve.liquidityIndex *
                    (1e18 +
                        (liquidityRate * 1e14 * timeElapsed) /
                        SECONDS_PER_YEAR)) /
                1e18;
            reserve.variableBorrowIndex =
                (reserve.variableBorrowIndex *
                    (1e18 +
                        (borrowAPY * 1e14 * timeElapsed) /
                        SECONDS_PER_YEAR)) /
                1e18;

            reserve.lastUpdateTimestamp = block.timestamp;
        }
        emit ReserveDataUpdated(
            _tokenAddress,
            reserve.liquidityIndex,
            reserve.variableBorrowIndex,
            reserve.currentLiquidityRate,
            reserve.currentVariableBorrowRate,
            reserve.lastUpdateTimestamp
        );
    } // hàm cập nhật lãi xuất

    function getReserveData(
        address _tokenAddress
    )
        external
        view
        returns (
            uint256 liquidityIndex,
            uint256 variableBorrowIndex,
            uint256 currentLiquidityRate,
            uint256 currentVariableBorrowRate
        )
    {
        ReserveData storage reserve = reserves[_tokenAddress];
        return (
            reserve.liquidityIndex,
            reserve.variableBorrowIndex,
            reserve.currentLiquidityRate,
            reserve.currentVariableBorrowRate
        );
    } // lấy thông tin của 1 loại token
}
