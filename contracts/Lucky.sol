// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "./VRFConsumerBaseV2PlusUpgradeable.sol";
import "./DateTime/DateTimeContract.sol";
contract Lucky is
    UUPSUpgradeable,
    AutomationCompatibleInterface,
    VRFConsumerBaseV2PlusUpgradeable
{
    DateTimeContract public dateTimeContract;
    uint256 public roundCounter;
    uint256 public duration;
    uint256 public waitingTime;
    uint256 public chainlinkSubscriptionId;
    address public vrfCoordinator;
    bytes32 public keyHash;
    uint256 public feePercentage;

    address public allowedToken;
    uint256 public ticketPrice;
    uint256 public PriceFirstPrize;
    uint256 public PriceSecondPrize;
    uint256 public PriceThirdPrize;
    uint256 public firstPrizeTokenAmount;
    uint256 public secondPrizeTokenAmount;
    uint256 public thirdPrizeTokenAmount;
    uint256 public maxTicketsPerUser;

    address public forwarderAddress;
    enum RoundStatus {
        ENDED,
        CREATED,
        FAILED
    }
    struct Round {
        address firstPrize;
        address secondPrize;
        address thirdPrize;
        uint256 firstPrizeTokenAmount;
        uint256 secondPrizeTokenAmount;
        uint256 thirdPrizeTokenAmount;
        uint256 PriceFirstPrize;
        uint256 PriceSecondPrize;
        uint256 PriceThirdPrize;
        uint256 startTime;
        uint256 endTime;
        RoundStatus status;
        uint256 uniquePlayersCount;
        uint256 totalTicketsSold;
        address prizeToken;
        uint256 ticketPrice;
        uint256 duration;
        uint256 waitingTime;
    }

    mapping(uint256 => mapping(uint256 => address)) public ticketToOwner;
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => uint256) public requestIdToRoundId;
    mapping(uint256 => mapping(address => uint256)) public userTickets;
    mapping(uint256 => mapping(address => bool)) public paidWithNative;
    mapping(uint256 => mapping(address => bool)) public hasClaimedPrize;
    mapping(uint256 => mapping(address => bool)) public hasClaimedRefund;
    mapping(uint256 => mapping(address => bool)) public hasJoined;
    mapping(uint256 => uint256) public roundRandomRequestTime;
    mapping(uint256 => mapping(address => bool)) public transferredMoney;
    mapping(uint256 => mapping(address => bool)) public refundRequestSent;

    event RoundCreated(
        uint256 indexed roundId,
        uint256 ticketPrice,
        uint256 startTime,
        uint256 endTime
    );
    event RoundEnded(
        uint256 indexed roundId,
        address firstPrize,
        address secondPrize,
        address thirdPrize
    );
    event RoundFailed(uint256 indexed roundId);
    event AllowedTokenUpdated(address indexed newToken);
    event RoundParameterUpdated(
        uint256 ticketPrice,
        uint256 duration,
        uint256 waitingTime
    );
    event VRFParametersUpdated(
        address vrfCoordinator,
        bytes32 keyHash,
        uint256 subscriptionId
    );
    event ForwarderUpdated(address indexed newForwarder);
    event RoundParameterSet(
        uint256 firstPrizeTokenAmount,
        uint256 secondPrizeTokenAmount,
        uint256 thirdPrizeTokenAmount,
        uint256 PriceFirstPrize,
        uint256 PriceSecondPrize,
        uint256 PriceThirdPrize,
        uint256 maxTicketsPerUser
    );
    event TicketPurchased(
        address indexed player,
        uint256 indexed roundId,
        uint256 ticketCount,
        uint256 totalCost,
        uint256 totalTicketsOwned
    );
    event RefundClaimed(
        address indexed player,
        uint256 indexed roundId,
        uint256 refundAmount
    );
    event TicketPurchasedWithNative(
        address indexed player,
        uint256 indexed roundId,
        uint256 ticketCount,
        uint256 totalCost,
        uint256 totalTicketsOwned
    );
    event FeeUpdated(uint256 newFeePercentage);
    event FeeWithdrawn(address indexed admin, uint256 amount);
    event RoundTimeout(uint256 indexed roundId, uint256 timeoutAt);
    event PrizeTokensDeposited(
        uint256 roundId,
        address prizeTokenAddress,
        uint256 totalPrizeAmount
    );
    event RefundBonusClaimed(
        address indexed admin,
        uint256 indexed roundId,
        uint256 amount
    );

    function initialize(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId,
        address _allowedToken,
        address _dateTimeContract
    ) external initializer {
        VRFConsumerBaseV2PlusUpgradeable.__VRFConsumerBaseV2Plus_init(
            _vrfCoordinator
        );
        dateTimeContract = DateTimeContract(_dateTimeContract);

        vrfCoordinator = _vrfCoordinator;
        keyHash = _keyHash;
        chainlinkSubscriptionId = _subscriptionId;
        allowedToken = _allowedToken;
        roundCounter = 0;
        feePercentage = 1;
    }

    modifier OwnerOrContract() {
        require(
            msg.sender == address(this) || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }
    modifier validParams(
        uint256 _ticketPrice,
        uint256 _duration,
        uint256 _waitingTime
    ) {
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_duration > 0 && _duration <= 2 days, "Invalid duration");
        require(
            _waitingTime > 0 minutes && _waitingTime <= 15 minutes,
            "Invalid waiting time"
        );
        _;
    }
    function _authorizeUpgrade(
        address newImplementation
    ) internal view override onlyOwner {
        require(
            newImplementation != address(0),
            "New implementation cannot be zero address"
        );
    }

    function setAllowedToken(address _token) external onlyOwner {
        require(_token != address(0), "Token address cannot be zero");
        allowedToken = _token;
        emit AllowedTokenUpdated(_token);
    }

    function setForwarder(address _forwarderAddress) external onlyOwner {
        require(_forwarderAddress != address(0), "Invalid forwarder address");
        forwarderAddress = _forwarderAddress;
        emit ForwarderUpdated(_forwarderAddress);
    }

    function setVRFParameters(
        uint256 _subscriptionId,
        address _vrfCoordinator,
        bytes32 _keyHash
    ) external onlyOwner {
        chainlinkSubscriptionId = _subscriptionId;
        vrfCoordinator = _vrfCoordinator;
        keyHash = _keyHash;
        emit VRFParametersUpdated(_vrfCoordinator, _keyHash, _subscriptionId);
    }
    function setRound(
        uint256 _ticketPrice,
        uint256 _duration,
        uint256 _waitingTime
    ) external onlyOwner {
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(_waitingTime > 0, "Waiting time must be greater than 0");
        ticketPrice = _ticketPrice;
        duration = _duration;
        waitingTime = _waitingTime;
        emit RoundParameterUpdated(_ticketPrice, _duration, _waitingTime);
    }

    function setRoundParameters(
        uint256 _firstPrizeTokenAmount,
        uint256 _secondPrizeTokenAmount,
        uint256 _thirdPrizeTokenAmount,
        uint256 _PriceFirstPrize,
        uint256 _PriceSecondPrize,
        uint256 _PriceThirdPrize,
        uint256 _maxTicketsPerUser
    ) external onlyOwner {
        firstPrizeTokenAmount = _firstPrizeTokenAmount;
        secondPrizeTokenAmount = _secondPrizeTokenAmount;
        thirdPrizeTokenAmount = _thirdPrizeTokenAmount;
        maxTicketsPerUser = _maxTicketsPerUser;
        PriceFirstPrize = _PriceFirstPrize;
        PriceSecondPrize = _PriceSecondPrize;
        PriceThirdPrize = _PriceThirdPrize;

        emit RoundParameterSet(
            _firstPrizeTokenAmount,
            _secondPrizeTokenAmount,
            _thirdPrizeTokenAmount,
            _maxTicketsPerUser,
            _PriceFirstPrize,
            _PriceSecondPrize,
            _PriceThirdPrize
        );
    }
    function depositPrizeTokens(
        uint256 roundId,
        address prizeTokenAddress
    ) external onlyOwner {
        require(roundId > 0 && roundId <= roundCounter, "Invalid round ID");
        require(!transferredMoney[roundId][msg.sender], "Already deposited");
        require(prizeTokenAddress != address(0), "Invalid prize token address");
        rounds[roundId].prizeToken = prizeTokenAddress;

        uint256 totalPrizeTokens = firstPrizeTokenAmount +
            secondPrizeTokenAmount +
            thirdPrizeTokenAmount;
        IERC20 token = IERC20(prizeTokenAddress);
        require(
            token.allowance(msg.sender, address(this)) >= totalPrizeTokens,
            "Insufficient allowance"
        );
        require(
            token.transferFrom(msg.sender, address(this), totalPrizeTokens),
            "Transfer failed"
        );

        transferredMoney[roundId][msg.sender] = true;

        emit PrizeTokensDeposited(roundId, prizeTokenAddress, totalPrizeTokens);
    }

    function createRound(
        uint256 _duration,
        uint256 _waitingTime,
        uint256 _ticketPrice
    )
        external
        OwnerOrContract
        validParams(_ticketPrice, _duration, _waitingTime)
    {
        require(
            roundCounter == 0 ||
                rounds[roundCounter].status == RoundStatus.ENDED ||
                rounds[roundCounter].status == RoundStatus.FAILED,
            "Previous round not ended or failed"
        );
        uint256 endTime = block.timestamp + _duration;
        roundCounter++;
        rounds[roundCounter] = Round({
            firstPrize: address(0),
            secondPrize: address(0),
            thirdPrize: address(0),
            firstPrizeTokenAmount: firstPrizeTokenAmount,
            secondPrizeTokenAmount: secondPrizeTokenAmount,
            thirdPrizeTokenAmount: thirdPrizeTokenAmount,
            PriceFirstPrize: PriceFirstPrize,
            PriceSecondPrize: PriceSecondPrize,
            PriceThirdPrize: PriceThirdPrize,
            startTime: block.timestamp,
            endTime: endTime,
            status: RoundStatus.CREATED,
            uniquePlayersCount: 0,
            totalTicketsSold: 0,
            prizeToken: allowedToken,
            ticketPrice: _ticketPrice,
            duration: _duration,
            waitingTime: _waitingTime
        });
        transferredMoney[roundCounter][owner()] = false;
        emit RoundCreated(roundCounter, _ticketPrice, block.timestamp, endTime);
    }

    function buyTickets(uint256 ticketCount) external {
        require(
            transferredMoney[roundCounter][owner()],
            "Prize tokens not deposited for this round"
        );
        require(ticketCount > 0, "Ticket count must be greater than 0");
        require(
            rounds[roundCounter].status == RoundStatus.CREATED,
            "Round not created"
        );
        require(
            block.timestamp < rounds[roundCounter].endTime,
            "Round has ended"
        );
        require(
            userTickets[roundCounter][msg.sender] + ticketCount <=
                maxTicketsPerUser,
            "Exceeds max tickets per user"
        );

        uint256 totalCost = rounds[roundCounter].ticketPrice * ticketCount;
        IERC20 token = IERC20(allowedToken);
        require(
            token.allowance(msg.sender, address(this)) >= totalCost,
            "Insufficient allowance"
        );
        require(
            token.transferFrom(msg.sender, address(this), totalCost),
            "Transfer failed"
        );

        if (!hasJoined[roundCounter][msg.sender]) {
            hasJoined[roundCounter][msg.sender] = true;
            rounds[roundCounter].uniquePlayersCount++;
        }

        uint256 startTicketId = rounds[roundCounter].totalTicketsSold;

        for (uint256 i = 0; i < ticketCount; i++) {
            ticketToOwner[roundCounter][startTicketId + i] = msg.sender;
        }
        userTickets[roundCounter][msg.sender] += ticketCount;
        rounds[roundCounter].totalTicketsSold += ticketCount;
        emit TicketPurchased(
            msg.sender,
            roundCounter,
            ticketCount,
            totalCost,
            userTickets[roundCounter][msg.sender]
        );
    }

    function buyTicketsWithNative(uint256 ticketCount) external payable {
        require(
            transferredMoney[roundCounter][owner()],
            "Prize tokens not deposited for this round"
        );
        require(ticketCount > 0, "Ticket count must be greater than 0");
        require(
            rounds[roundCounter].status == RoundStatus.CREATED,
            "Round not created"
        );
        require(
            block.timestamp < rounds[roundCounter].endTime,
            "Round has ended"
        );
        require(
            userTickets[roundCounter][msg.sender] + ticketCount <=
                maxTicketsPerUser,
            "Exceeds max tickets per user"
        );

        uint256 totalCost = rounds[roundCounter].ticketPrice * ticketCount;
        require(msg.value == totalCost, "Incorrect ETH amount sent");

        paidWithNative[roundCounter][msg.sender] = true;

        if (!hasJoined[roundCounter][msg.sender]) {
            hasJoined[roundCounter][msg.sender] = true;
            rounds[roundCounter].uniquePlayersCount++;
        }

        uint256 startTicketId = rounds[roundCounter].totalTicketsSold;
        for (uint256 i = 0; i < ticketCount; i++) {
            ticketToOwner[roundCounter][startTicketId + i] = msg.sender;
        }

        userTickets[roundCounter][msg.sender] += ticketCount;
        rounds[roundCounter].totalTicketsSold += ticketCount;

        emit TicketPurchasedWithNative(
            msg.sender,
            roundCounter,
            ticketCount,
            totalCost,
            userTickets[roundCounter][msg.sender]
        );
    }

    function checkUpkeep(
        bytes calldata
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = false;
        performData = "";
        if (
            rounds[roundCounter].status == RoundStatus.CREATED &&
            block.timestamp >= rounds[roundCounter].endTime
        ) {
            upkeepNeeded = true;
            performData = abi.encode("endRound");
            return (upkeepNeeded, performData);
        }
        if (
            rounds[roundCounter].status == RoundStatus.ENDED &&
            roundRandomRequestTime[roundCounter] > 0 &&
            block.timestamp >
            roundRandomRequestTime[roundCounter] + waitingTime &&
            rounds[roundCounter].firstPrize == address(0) &&
            rounds[roundCounter].secondPrize == address(0) &&
            rounds[roundCounter].thirdPrize == address(0)
        ) {
            upkeepNeeded = true;
            performData = abi.encode("failRound");
            return (upkeepNeeded, performData);
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        require(msg.sender == forwarderAddress, "Not authorized");
        string memory action = abi.decode(performData, (string));
        if (keccak256(bytes(action)) == keccak256(bytes("endRound"))) {
            if (rounds[roundCounter].uniquePlayersCount < 3) {
                rounds[roundCounter].status = RoundStatus.FAILED;
                emit RoundFailed(roundCounter);
                if (transferredMoney[roundCounter][owner()]) {
                    this.createRound(duration, waitingTime, ticketPrice);
                }
                return;
            }
            endRound();
        }
        if (keccak256(bytes(action)) == keccak256(bytes("failRound"))) {
            emit RoundTimeout(roundCounter, block.timestamp);
            rounds[roundCounter].status = RoundStatus.FAILED;
            emit RoundFailed(roundCounter);
            if (transferredMoney[roundCounter][owner()]) {
                this.createRound(duration, waitingTime, ticketPrice);
            }
        }
    }
    function endRound() internal {
        rounds[roundCounter].status = RoundStatus.ENDED;

        try
            this.requestRandomWords(
                keyHash,
                chainlinkSubscriptionId,
                2500000,
                3,
                3
            )
        returns (uint256 result) {
            uint256 requestId = result;
            requestIdToRoundId[requestId] = roundCounter;
            roundRandomRequestTime[roundCounter] = block.timestamp;
        } catch {
            rounds[roundCounter].status = RoundStatus.FAILED;
            emit RoundFailed(roundCounter);
            this.createRound(duration, waitingTime, ticketPrice);
        }
    }
    function requestRandomWords(
        bytes32 _keyHash,
        uint256 _chainlinkSubscriptionId,
        uint32 _callbackGasLimit,
        uint32 _numWords,
        uint16 _requestConfirmations
    ) external OwnerOrContract returns (uint256 requestId) {
        require(
            rounds[roundCounter].status == RoundStatus.ENDED,
            "Round not ended"
        );
        VRFV2PlusClient.RandomWordsRequest memory req = VRFV2PlusClient
            .RandomWordsRequest({
                keyHash: _keyHash,
                subId: _chainlinkSubscriptionId,
                requestConfirmations: _requestConfirmations,
                callbackGasLimit: _callbackGasLimit,
                numWords: _numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            });
        requestId = IVRFCoordinatorV2Plus(vrfCoordinator).requestRandomWords(
            req
        );
        return requestId;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        uint256 roundId = requestIdToRoundId[requestId];
        if (rounds[roundId].status != RoundStatus.ENDED) {
            return;
        }
        require(
            roundId > 0 && roundId == roundCounter,
            "Invalid request or round ID"
        );
        require(rounds[roundId].status == RoundStatus.ENDED, "Round not ended");
        require(randomWords.length == 3, "Invalid random words");

        uint256 totalTickets = rounds[roundId].totalTicketsSold;

        address firstPrizeWinner = address(0);
        address secondPrizeWinner = address(0);
        address thirdPrizeWinner = address(0);

        uint256[] memory winningTicketIds = new uint256[](3);
        bool[] memory used = new bool[](totalTickets);

        if (totalTickets > 0) {
            winningTicketIds[0] = randomWords[0] % totalTickets;
            firstPrizeWinner = ticketToOwner[roundId][winningTicketIds[0]];
            used[winningTicketIds[0]] = true;
        }

        if (totalTickets > 1) {
            uint256 secondRandom = randomWords[1] % totalTickets;
            uint256 attempts = 0;
            while (used[secondRandom] && attempts < totalTickets) {
                secondRandom = (secondRandom + 1) % totalTickets;
                attempts++;
            }
            if (!used[secondRandom]) {
                winningTicketIds[1] = secondRandom;
                secondPrizeWinner = ticketToOwner[roundId][secondRandom];
                used[secondRandom] = true;
            }
        }

        if (totalTickets > 2) {
            uint256 thirdRandom = randomWords[2] % totalTickets;
            uint256 attempts = 0;
            while (used[thirdRandom] && attempts < totalTickets) {
                thirdRandom = (thirdRandom + 1) % totalTickets;
                attempts++;
            }
            if (!used[thirdRandom]) {
                winningTicketIds[2] = thirdRandom;
                thirdPrizeWinner = ticketToOwner[roundId][thirdRandom];
            }
        }
        rounds[roundId].firstPrize = firstPrizeWinner;
        rounds[roundId].secondPrize = secondPrizeWinner;
        rounds[roundId].thirdPrize = thirdPrizeWinner;

        emit RoundEnded(
            roundId,
            firstPrizeWinner,
            secondPrizeWinner,
            thirdPrizeWinner
        );

        this.createRound(duration, waitingTime, ticketPrice);
    }

    function claimRefund(uint256 roundId) external {
        require(roundId > 0 && roundId <= roundCounter, "Invalid round ID");
        require(
            rounds[roundId].status == RoundStatus.FAILED,
            "Round not failed"
        );
        require(userTickets[roundId][msg.sender] > 0, "No tickets purchased");
        require(
            !hasClaimedRefund[roundId][msg.sender],
            "Refund already claimed"
        );

        uint256 refundAmount = userTickets[roundId][msg.sender] *
            rounds[roundId].ticketPrice;

        hasClaimedRefund[roundId][msg.sender] = true;

        if (paidWithNative[roundId][msg.sender]) {
            require(
                address(this).balance >= refundAmount,
                "Insufficient ETH balance"
            );
            payable(msg.sender).transfer(refundAmount);
        } else {
            IERC20 token = IERC20(allowedToken);
            require(
                token.balanceOf(address(this)) >= refundAmount,
                "Insufficient token balance"
            );
            require(
                token.transfer(msg.sender, refundAmount),
                "Token transfer failed"
            );
        }

        emit RefundClaimed(msg.sender, roundId, refundAmount);
    }
    function refundPrizeTokensOnFailed(uint256 roundId) external onlyOwner {
        require(
            rounds[roundId].status == RoundStatus.FAILED,
            "Round not failed"
        );
        require(transferredMoney[roundId][msg.sender], "Prize not deposited");
        require(!refundRequestSent[roundId][msg.sender], "Already refunded");

        uint256 totalPrizeTokens = firstPrizeTokenAmount +
            secondPrizeTokenAmount +
            thirdPrizeTokenAmount;
        IERC20 token = IERC20(allowedToken);
        require(
            token.balanceOf(address(this)) >= totalPrizeTokens,
            "Insufficient balance"
        );
        require(
            token.transfer(msg.sender, totalPrizeTokens),
            "Transfer failed"
        );

        refundRequestSent[roundId][msg.sender] = true;
        emit RefundBonusClaimed(msg.sender, roundId, totalPrizeTokens);
    }
    function checkOwnPrizes(
        uint256 roundId
    )
        external
        view
        returns (
            bool isWinner,
            uint256 totalTokenAmount,
            uint256 totalPrice,
            bool firstPrize,
            bool secondPrize,
            bool thirdPrize
        )
    {
        require(roundId > 0 && roundId <= roundCounter, "Invalid round ID");
        Round memory round = rounds[roundId];
        uint256 tokenAmount = 0;
        uint256 price = 0;
        bool winFirst = false;
        bool winSecond = false;
        bool winThird = false;

        if (msg.sender == round.firstPrize) {
            tokenAmount += round.firstPrizeTokenAmount;
            price += round.PriceFirstPrize * round.firstPrizeTokenAmount;
            winFirst = true;
        }
        if (msg.sender == round.secondPrize) {
            tokenAmount += round.secondPrizeTokenAmount;
            price += round.PriceSecondPrize * round.secondPrizeTokenAmount;
            winSecond = true;
        }
        if (msg.sender == round.thirdPrize) {
            tokenAmount += round.thirdPrizeTokenAmount;
            price += round.PriceThirdPrize * round.thirdPrizeTokenAmount;
            winThird = true;
        }
        bool winner = winFirst || winSecond || winThird;
        return (winner, tokenAmount, price, winFirst, winSecond, winThird);
    }
    function getRoundInfo(
        uint256 roundId
    )
        external
        view
        returns (
            address firstPrizeWinner,
            address secondPrizeWinner,
            address thirdPrizeWinner,
            uint256 roundTicketPrice,
            uint256 startTime,
            uint256 endTime,
            RoundStatus status,
            uint256 uniquePlayersCount,
            uint256 totalTicketsSold,
            uint256 firstPrizeTokenAmountOut,
            uint256 secondPrizeTokenAmountOut,
            uint256 thirdPrizeTokenAmountOut,
            uint256 PriceFirstPrizeOut,
            uint256 PriceSecondPrizeOut,
            uint256 PriceThirdPrizeOut
        )
    {
        require(roundId > 0 && roundId <= roundCounter, "Invalid round ID");

        Round memory round = rounds[roundId];

        return (
            round.firstPrize,
            round.secondPrize,
            round.thirdPrize,
            round.ticketPrice,
            round.startTime,
            round.endTime,
            round.status,
            round.uniquePlayersCount,
            round.totalTicketsSold,
            round.firstPrizeTokenAmount,
            round.secondPrizeTokenAmount,
            round.thirdPrizeTokenAmount,
            round.PriceFirstPrize,
            round.PriceSecondPrize,
            round.PriceThirdPrize
        );
    }
    receive() external payable {}
}
