import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { MockToken } from "../typechain-types/contracts/Mock/MockToken";
import { DateTimeContract } from "../typechain-types/contracts/DateTime/DateTimeContract";
import { Lucky } from "../typechain-types/contracts/Lucky";
import { AbiCoder } from "ethers";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("Lucky", function () {
  async function setup() {
    const [admin, admin2, user1, user2, user3, user4, forwarder] =
      await ethers.getSigners();

    const BASE_FEE = "1000000000000000";
    const GAS_PRICE = "50000000000";
    const WEI_PER_UNIT_LINK = "6032405486646792";

    const VRFCoordinatorV2_5MockFactory = await ethers.getContractFactory(
      "VRFCoordinatorV2_5Mock"
    );
    const vrfCoordinatorV2_5Mock = await VRFCoordinatorV2_5MockFactory.deploy(
      BASE_FEE,
      GAS_PRICE,
      WEI_PER_UNIT_LINK
    );
    await vrfCoordinatorV2_5Mock.waitForDeployment();

    const tx = await vrfCoordinatorV2_5Mock["createSubscription"]();
    const receipt = await tx.wait();
    if (!receipt) throw new Error("Transaction receipt is null");
    const logs = receipt.logs;
    const subscriptionCreatedEvent = vrfCoordinatorV2_5Mock.interface.getEvent(
      "SubscriptionCreated"
    );
    if (!subscriptionCreatedEvent) {
      throw new Error("Event not found in contract ABI");
    }

    const decodedLogs = vrfCoordinatorV2_5Mock.interface.decodeEventLog(
      subscriptionCreatedEvent,
      logs[0].data,
      logs[0].topics
    );
    const subscriptionId = BigInt(decodedLogs[0]);

    await vrfCoordinatorV2_5Mock["fundSubscription"](
      subscriptionId,
      BigInt("100000000000000000000")
    );

    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    const mockToken = (await MockTokenFactory.deploy(
      admin.address
    )) as MockToken;
    await mockToken.waitForDeployment();

    const initialSupply = ethers.parseUnits("9999", 18);
    await mockToken.connect(admin).mint(admin.address, initialSupply);
    await mockToken.connect(admin).mint(user1.address, initialSupply);
    await mockToken.connect(admin).mint(user2.address, initialSupply);
    await mockToken.connect(admin).mint(user3.address, initialSupply);

    const DateTimeContractFactory = await ethers.getContractFactory(
      "DateTimeContract"
    );
    const dateTimeContract =
      (await DateTimeContractFactory.deploy()) as DateTimeContract;

    const LuckyFactory = await ethers.getContractFactory("Lucky");
    const lucky = (await LuckyFactory.deploy()) as Lucky;

    const vrfCoordinator = vrfCoordinatorV2_5Mock.getAddress();
    const keyHash =
      "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";

    await lucky.initialize(
      vrfCoordinator,
      keyHash,
      subscriptionId,
      await mockToken.getAddress(),
      await dateTimeContract.getAddress()
    );

    await vrfCoordinatorV2_5Mock["addConsumer"](
      subscriptionId,
      lucky.getAddress()
    );

    const ticketPrice = ethers.parseUnits("1", 18);
    const duration = 3600;

    await lucky
      .connect(admin)
      .setRoundParameters(
        ethers.parseUnits("1000", 18),
        ethers.parseUnits("500", 18),
        ethers.parseUnits("200", 18),
        100,
        ethers.parseUnits("10", 18),
        ethers.parseUnits("5", 18),
        100
      );
    await network.provider.send("evm_increaseTime", [14400]);
    await network.provider.send("evm_mine");

    await lucky.connect(admin).setForwarder(forwarder.address);
    return {
      lucky,
      vrfCoordinatorV2_5Mock,
      keyHash,
      subscriptionId,
      mockToken,
      dateTimeContract,
      ticketPrice,
      duration,
      waitingTime: 900,
      admin,
      admin2,
      user1,
      user2,
      user3,
      user4,
      forwarder,
    };
  }
  async function setupNative() {
    const {
      lucky,
      admin,
      user1,
      user2,
      user3,
      duration,
      waitingTime,
      mockToken,
      forwarder,
    } = await loadFixture(setup);
    const ticketPrice = await lucky.ticketPrice();
    return {
      lucky,
      admin,
      user1,
      user2,
      user3,
      duration,
      waitingTime,
      ticketPrice,
      mockToken,
      forwarder,
    };
  }
  describe("setAllowedToken", function () {
    it("should set allowedToken called by owner", async function () {
      const { lucky, mockToken, admin } = await loadFixture(setup);

      await expect(
        lucky.connect(admin).setAllowedToken(await mockToken.getAddress())
      )
        .to.emit(lucky, "AllowedTokenUpdated")
        .withArgs(await mockToken.getAddress());

      expect(await lucky.allowedToken()).to.equal(await mockToken.getAddress());
    });
    it("should revert setAllowedToken called by non-owner", async function () {
      const { lucky, mockToken, user1 } = await loadFixture(setup);

      await expect(
        lucky.connect(user1).setAllowedToken(await mockToken.getAddress())
      ).to.be.revertedWith("Only callable by owner");
    });
    it("should revert setAllowedToken with zero address", async function () {
      const { lucky, admin } = await loadFixture(setup);

      await expect(
        lucky.connect(admin).setAllowedToken(ethers.ZeroAddress)
      ).to.be.revertedWith("Token address cannot be zero");
    });
  });
  describe("setForwarder", function () {
    it("should setForwarder successfully", async function () {
      const { lucky, admin, forwarder } = await loadFixture(setup);

      await expect(lucky.connect(admin).setForwarder(forwarder.address))
        .to.emit(lucky, "ForwarderUpdated")
        .withArgs(forwarder.address);

      expect(await lucky.forwarderAddress()).to.equal(forwarder.address);
    });
    it("should revert setForwarder called by non-owner", async function () {
      const { lucky, user1, forwarder } = await loadFixture(setup);

      await expect(
        lucky.connect(user1).setForwarder(forwarder.address)
      ).to.be.revertedWith("Only callable by owner");
    });
    it("should revert if the Invalid forwarder address", async function () {
      const { lucky, admin } = await loadFixture(setup);

      await expect(
        lucky.connect(admin).setForwarder(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid forwarder address");
    });
  });
  describe("setVRFParameters", function () {
    it("should set VRF parameters and emit event when called by owner", async function () {
      const { lucky, admin } = await loadFixture(setup);

      const subscriptionId = 123;
      const vrfCoordinator = "0x0000000000000000000000000000000000000123";
      const keyHash =
        "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";

      await expect(
        lucky
          .connect(admin)
          .setVRFParameters(subscriptionId, vrfCoordinator, keyHash)
      )
        .to.emit(lucky, "VRFParametersUpdated")
        .withArgs(vrfCoordinator, keyHash, subscriptionId);

      expect(await lucky.chainlinkSubscriptionId()).to.equal(subscriptionId);
      expect(await lucky.vrfCoordinator()).to.equal(vrfCoordinator);
      expect(await lucky.keyHash()).to.equal(keyHash);
    });
    it("should revert when setVRFParameters is called by non-owner", async function () {
      const { lucky, user1 } = await loadFixture(setup);

      const subscriptionId = 123;
      const vrfCoordinator = "0x0000000000000000000000000000000000000123";
      const keyHash =
        "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";

      await expect(
        lucky
          .connect(user1)
          .setVRFParameters(subscriptionId, vrfCoordinator, keyHash)
      ).to.be.revertedWith("Only callable by owner");
    });
    it("should revert if the caller is not onlyOwner", async function () {
      const { lucky, user1 } = await loadFixture(setup);

      await expect(
        lucky.connect(user1).setRoundParameters(0, 0, 0, 0, 0, 0, 0)
      ).to.be.revertedWith("Only callable by owner");
    });
  });
  describe("depositPrizeTokens", function () {
    it("should deposit prize tokens successfully", async function () {
      const { lucky, admin, mockToken } = await loadFixture(setup);
      await lucky
        .connect(admin)
        .createRound(3600, 900, ethers.parseUnits("1", 18));

      const roundId = await lucky.roundCounter();

      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await expect(
        lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress())
      )
        .to.emit(lucky, "PrizeTokensDeposited")
        .withArgs(roundId, await mockToken.getAddress(), totalPrizeTokens);
      expect(await lucky.transferredMoney(roundId, admin.address)).to.equal(
        true
      );
      expect((await lucky.rounds(roundId)).prizeToken).to.equal(
        await mockToken.getAddress()
      );
    });
    it("should revert depositPrizeTokens called by non-owner", async function () {
      const { lucky, admin, user1, mockToken } = await loadFixture(setup);
      await lucky
        .connect(admin)
        .createRound(3600, 900, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      await expect(
        lucky
          .connect(user1)
          .depositPrizeTokens(roundId, await mockToken.getAddress())
      ).to.be.revertedWith("Only callable by owner");
    });
    it("should revert if the round is invalid", async function () {
      const { lucky, admin, mockToken } = await loadFixture(setup);

      await expect(
        lucky
          .connect(admin)
          .depositPrizeTokens(999, await mockToken.getAddress())
      ).to.be.revertedWith("Invalid round ID");
    });
    it("should revert if the Already deposited prize tokens", async function () {
      const { lucky, admin, mockToken } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(3600, 900, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());

      await expect(
        lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress())
      ).to.be.revertedWith("Already deposited");
    });
    it("should revert if the Invalid prize token address ", async function () {
      const { lucky, admin } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(3600, 900, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      await expect(
        lucky.connect(admin).depositPrizeTokens(roundId, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid prize token address");
    });
    it("should revert if the Insufficient allowance", async function () {
      const { lucky, admin, mockToken } = await loadFixture(setup);
      await lucky
        .connect(admin)
        .createRound(3600, 900, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();
      await expect(
        lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress())
      ).to.be.revertedWith("Insufficient allowance");
    });
    it("should revert with 'Transfer failed' if transferFrom returns false", async function () {
      const { lucky, admin, mockToken } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(3600, 900, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;

      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);

      await mockToken.connect(admin).setTransferShouldFail(true);

      await expect(
        lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress())
      ).to.be.revertedWith("Token transfer failed");
    });
  });
  describe("setRound", function () {
    it("should revert if the caller is not onlyOwner", async function () {
      const { lucky, user1 } = await loadFixture(setup);
      await expect(
        lucky.connect(user1).setRound(3600, 900, ethers.parseUnits("1", 18))
      ).to.be.revertedWith("Only callable by owner");
    });
    it("should revert if the Ticket price must be greater than 0", async function () {
      const { lucky, admin } = await loadFixture(setup);
      await expect(
        lucky.connect(admin).setRound(0, 3600, 900)
      ).to.be.revertedWith("Ticket price must be greater than 0");
    });
    it("should revert if the Duration must be greater than 0", async function () {
      const { lucky, admin } = await loadFixture(setup);
      await expect(
        lucky.connect(admin).setRound(3600, 0, 900)
      ).to.be.revertedWith("Duration must be greater than 0");
    });
    it("should revert if the Waiting time must be greater than 0", async function () {
      const { lucky, admin } = await loadFixture(setup);
      await expect(
        lucky.connect(admin).setRound(10, 3600, 0)
      ).to.be.revertedWith("Waiting time must be greater than 0");
    });
  });

  describe("createRound", function () {
    it("should create a new round successfully", async function () {
      const { lucky, admin, duration, waitingTime, ticketPrice } =
        await loadFixture(setup);

      const tx = await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();
      const round = await lucky.rounds(roundId);

      await expect(tx)
        .to.emit(lucky, "RoundCreated")
        .withArgs(roundId, ticketPrice, round.startTime, round.endTime);

      expect(round.ticketPrice).to.equal(ticketPrice);
      expect(round.status).to.equal(1);
    });
    it("should revert if caller is not owner or contract", async function () {
      const { lucky, admin, user1, duration, waitingTime, ticketPrice } =
        await loadFixture(setup);
      await expect(
        lucky
          .connect(user1)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18))
      ).to.be.revertedWith("Not authorized");
    });
    it("should revert if the duration is zero", async function () {
      const { lucky, admin, duration, waitingTime, ticketPrice } =
        await loadFixture(setup);
      await expect(
        lucky
          .connect(admin)
          .createRound(0, waitingTime, ethers.parseUnits("1", 18))
      ).to.be.revertedWith("Invalid duration");
    });
    it("should revert if the waiting time is zero", async function () {
      const { lucky, admin, duration, waitingTime, ticketPrice } =
        await loadFixture(setup);

      await expect(
        lucky
          .connect(admin)
          .createRound(duration, 0, ethers.parseUnits("1", 18))
      ).to.be.revertedWith("Invalid waiting time");
    });
    it("should revert if previous round is not ENDED or FAILED", async function () {
      const { lucky, admin, duration, waitingTime, ticketPrice, mockToken } =
        await loadFixture(setup);
      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();
      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());
      await mockToken.connect(admin).approve(lucky.getAddress(), ticketPrice);
      await lucky.connect(admin).buyTickets(1);
      await expect(
        lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18))
      ).to.be.revertedWith("Previous round not ended or failed");
    });
    it("should allow createRound when previous round is ENDED", async function () {
      const {
        lucky,
        admin,
        user1,
        user2,
        user3,
        duration,
        waitingTime,
        ticketPrice,
        mockToken,
        forwarder,
      } = await loadFixture(setup);
      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();
      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());
      for (const user of [user1, user2, user3]) {
        await mockToken.connect(user).approve(lucky.getAddress(), ticketPrice);
        await lucky.connect(user).buyTickets(1);
      }
      await network.provider.send("evm_increaseTime", [duration + 1]);
      await network.provider.send("evm_mine");
      const performData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string"],
        ["endRound"]
      );
      await lucky.connect(forwarder).performUpkeep(performData);
      await expect(
        lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18))
      ).to.emit(lucky, "RoundCreated");
    });
    it("should allow createRound when previous round is FAILED (no deposit -> no auto-create)", async function () {
      const { lucky, admin, duration, waitingTime, forwarder } =
        await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      await network.provider.send("evm_increaseTime", [duration + 1]);
      await network.provider.send("evm_mine");

      const performData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string"],
        ["endRound"]
      );
      await lucky.connect(forwarder).performUpkeep(performData);

      const prevRound = await lucky.rounds(roundId);
      expect(prevRound.status).to.equal(2);
      await expect(
        lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18))
      ).to.emit(lucky, "RoundCreated");
    });
  });
  describe("buyTickets", function () {
    it("should allow a user to buy tickets with ERC20 when prize tokens deposited", async function () {
      const {
        lucky,
        admin,
        user1,
        mockToken,
        duration,
        waitingTime,
        ticketPrice,
      } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());
      const buyCount = 2;
      const totalCost = ticketPrice * BigInt(buyCount);
      await mockToken.connect(user1).approve(lucky.getAddress(), totalCost);

      await expect(lucky.connect(user1).buyTickets(buyCount))
        .to.emit(lucky, "TicketPurchased")
        .withArgs(user1.address, roundId, buyCount, totalCost, buyCount);

      expect(await lucky.userTickets(roundId, user1.address)).to.equal(
        buyCount
      );
      const updatedRound = await lucky.rounds(roundId);
      expect(updatedRound.totalTicketsSold).to.equal(buyCount);
      expect(updatedRound.uniquePlayersCount).to.equal(1);
    });
    it("should revert if the Prize tokens not deposited for this round ", async function () {
      const {
        lucky,
        admin,
        user1,
        mockToken,
        duration,
        waitingTime,
        ticketPrice,
      } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      const buyCount = 2;
      const totalCost = ticketPrice * BigInt(buyCount);
      await mockToken.connect(user1).approve(lucky.getAddress(), totalCost);

      await expect(
        lucky.connect(user1).buyTickets(buyCount)
      ).to.be.revertedWith("Prize tokens not deposited for this round");
    });
    it("should revert if the Ticket count must be greater than 0 ", async function () {
      const {
        lucky,
        admin,
        user1,
        mockToken,
        duration,
        waitingTime,
        ticketPrice,
      } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());

      const buyCount = 0;
      const totalCost = ticketPrice * BigInt(buyCount);
      await mockToken.connect(user1).approve(lucky.getAddress(), totalCost);

      await expect(
        lucky.connect(user1).buyTickets(buyCount)
      ).to.be.revertedWith("Ticket count must be greater than 0");
    });
    it("should revert if the Exceeds max tickets per user", async function () {
      const {
        lucky,
        admin,
        user1,
        mockToken,
        duration,
        waitingTime,
        ticketPrice,
      } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());

      const buyCount = 101;
      const totalCost = ticketPrice * BigInt(buyCount);
      await mockToken.connect(user1).approve(lucky.getAddress(), totalCost);

      await expect(
        lucky.connect(user1).buyTickets(buyCount)
      ).to.be.revertedWith("Exceeds max tickets per user");
    });
    it("should revert if the Round not created", async function () {
      const {
        lucky,
        admin,
        user1,
        user2,
        user3,
        mockToken,
        duration,
        waitingTime,
        ticketPrice,
        forwarder,
      } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());

      for (const user of [user1, user2, user3]) {
        await mockToken.connect(user).approve(lucky.getAddress(), ticketPrice);
        await lucky.connect(user).buyTickets(1);
      }

      await network.provider.send("evm_increaseTime", [duration + 1]);
      await network.provider.send("evm_mine");

      const performData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string"],
        ["endRound"]
      );
      await lucky.connect(forwarder).performUpkeep(performData);

      const buyCount = 1;
      await mockToken
        .connect(user1)
        .approve(lucky.getAddress(), ticketPrice * BigInt(buyCount));

      await expect(
        lucky.connect(user1).buyTickets(buyCount)
      ).to.be.revertedWith("Round not created");
    });
    it("should revert if the Round has ended", async function () {
      const {
        lucky,
        admin,
        user1,
        mockToken,
        duration,
        waitingTime,
        ticketPrice,
      } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());

      await network.provider.send("evm_increaseTime", [duration + 1]);
      await network.provider.send("evm_mine");

      const buyCount = 1;
      await mockToken
        .connect(user1)
        .approve(lucky.getAddress(), ticketPrice * BigInt(buyCount));

      await expect(
        lucky.connect(user1).buyTickets(buyCount)
      ).to.be.revertedWith("Round has ended");
    });
    it("should revert if the Insufficient allowance", async function () {
      const {
        lucky,
        admin,
        user1,
        mockToken,
        duration,
        waitingTime,
        ticketPrice,
      } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());

      const buyCount = 2;
      await expect(
        lucky.connect(user1).buyTickets(buyCount)
      ).to.be.revertedWith("Insufficient allowance");
    });
    it("should revert if the Token transfer failed", async function () {
      const {
        lucky,
        admin,
        user1,
        mockToken,
        duration,
        waitingTime,
        ticketPrice,
      } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();

      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());

      const buyCount = 2;
      const totalCost = ticketPrice * BigInt(buyCount);
      await mockToken.connect(user1).approve(lucky.getAddress(), totalCost);

      await mockToken.connect(admin).setTransferShouldFail(true);

      await expect(
        lucky.connect(user1).buyTickets(buyCount)
      ).to.be.revertedWith("Token transfer failed");
    });
    it("should user as joined and unique players count increments", async function () {
      const {
        lucky,
        admin,
        user1,
        mockToken,
        duration,
        waitingTime,
        ticketPrice,
      } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();
      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());

      expect((await lucky.rounds(roundId)).uniquePlayersCount).to.equal(0);
      expect(await lucky.hasJoined(roundId, user1.address)).to.equal(false);

      const buyCount = 1;
      const totalCost = ticketPrice * BigInt(buyCount);
      await mockToken.connect(user1).approve(lucky.getAddress(), totalCost);
      await lucky.connect(user1).buyTickets(buyCount);

      expect(await lucky.hasJoined(roundId, user1.address)).to.equal(true);
      expect((await lucky.rounds(roundId)).uniquePlayersCount).to.equal(1);
      expect(await lucky.userTickets(roundId, user1.address)).to.equal(
        buyCount
      );
    });
    it("should user buyticket 2 ticket unique players count remains same", async function () {
      const {
        lucky,
        admin,
        user1,
        mockToken,
        duration,
        waitingTime,
        ticketPrice,
      } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();
      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());

      await mockToken.connect(user1).approve(lucky.getAddress(), ticketPrice);
      await lucky.connect(user1).buyTickets(1);
      expect((await lucky.rounds(roundId)).uniquePlayersCount).to.equal(1);

      const more = 2;
      const moreCost = ticketPrice * BigInt(more);
      await mockToken.connect(user1).approve(lucky.getAddress(), moreCost);
      await lucky.connect(user1).buyTickets(more);

      expect((await lucky.rounds(roundId)).uniquePlayersCount).to.equal(1);
      expect(await lucky.userTickets(roundId, user1.address)).to.equal(
        1 + more
      );
    });
    it("should much user buyticket ", async function () {
      const {
        lucky,
        admin,
        user1,
        mockToken,
        duration,
        waitingTime,
        ticketPrice,
        user2,
      } = await loadFixture(setup);

      await lucky
        .connect(admin)
        .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
      const roundId = await lucky.roundCounter();
      const round = await lucky.rounds(roundId);
      const totalPrizeTokens =
        round.firstPrizeTokenAmount +
        round.secondPrizeTokenAmount +
        round.thirdPrizeTokenAmount;
      await mockToken
        .connect(admin)
        .approve(lucky.getAddress(), totalPrizeTokens);
      await lucky
        .connect(admin)
        .depositPrizeTokens(roundId, await mockToken.getAddress());
      await mockToken.connect(user1).approve(lucky.getAddress(), ticketPrice);
      await lucky.connect(user1).buyTickets(1);
      expect((await lucky.rounds(roundId)).uniquePlayersCount).to.equal(1);

      await mockToken.connect(user2).approve(lucky.getAddress(), ticketPrice);
      await lucky.connect(user2).buyTickets(1);
      expect((await lucky.rounds(roundId)).uniquePlayersCount).to.equal(2);
    });
    describe("buyTicket Native", function () {
      it("allows buying tickets with native ETH and updates state correctly", async function () {
        const {
          lucky,
          admin,
          user1,
          mockToken,
          duration,
          waitingTime,
          ticketPrice,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        expect((await lucky.rounds(roundId)).status).to.equal(1);
        expect(await lucky.paidWithNative(roundId, user1.address)).to.equal(
          false
        );
        expect(await lucky.hasJoined(roundId, user1.address)).to.equal(false);
        expect(await lucky.userTickets(roundId, user1.address)).to.equal(0);

        const buyCount = 2;
        const totalCost =
          (await lucky.rounds(roundId)).ticketPrice * BigInt(buyCount);

        await expect(
          lucky
            .connect(user1)
            .buyTicketsWithNative(buyCount, { value: totalCost })
        )
          .to.emit(lucky, "TicketPurchasedWithNative")
          .withArgs(user1.address, roundId, buyCount, totalCost, buyCount);

        expect(await lucky.paidWithNative(roundId, user1.address)).to.equal(
          true
        );
        expect(await lucky.hasJoined(roundId, user1.address)).to.equal(true);
        expect(await lucky.userTickets(roundId, user1.address)).to.equal(
          buyCount
        );
        const updatedRound = await lucky.rounds(roundId);
        expect(updatedRound.totalTicketsSold).to.equal(buyCount);
        expect(updatedRound.uniquePlayersCount).to.equal(1);
      });
      it("should revert if the Prize tokens not deposited for this round", async function () {
        const { lucky, admin, user1, duration, waitingTime, ticketPrice } =
          await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const buyCount = 2;
        const totalCost =
          (await lucky.rounds(roundId)).ticketPrice * BigInt(buyCount);

        await expect(
          lucky
            .connect(user1)
            .buyTicketsWithNative(buyCount, { value: totalCost })
        ).to.be.revertedWith("Prize tokens not deposited for this round");
      });
      it("should revert if the Ticket count must be greater than 0 ", async function () {
        const {
          lucky,
          admin,
          user1,
          mockToken,
          duration,
          waitingTime,
          ticketPrice,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        const buyCount = 0;
        const totalCost =
          (await lucky.rounds(roundId)).ticketPrice * BigInt(buyCount);

        await expect(
          lucky
            .connect(user1)
            .buyTicketsWithNative(buyCount, { value: totalCost })
        ).to.be.revertedWith("Ticket count must be greater than 0");
      });
      it("should revert if the Round not created", async function () {
        const {
          lucky,
          admin,
          user1,
          user2,
          user3,
          mockToken,
          duration,
          waitingTime,
          ticketPrice,
          forwarder,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        for (const user of [user1, user2, user3]) {
          await lucky
            .connect(user)
            .buyTicketsWithNative(1, { value: ticketPrice });
        }

        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const performData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await lucky.connect(forwarder).performUpkeep(performData);

        const buyCount = 1;
        const totalCost =
          (await lucky.rounds(roundId)).ticketPrice * BigInt(buyCount);

        await expect(
          lucky
            .connect(user1)
            .buyTicketsWithNative(buyCount, { value: totalCost })
        ).to.be.revertedWith("Round not created");
      });
      it("should revert if the Round has ended", async function () {
        const {
          lucky,
          admin,
          user1,
          mockToken,
          duration,
          waitingTime,
          ticketPrice,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const buyCount = 1;
        await mockToken
          .connect(user1)
          .approve(lucky.getAddress(), ticketPrice * BigInt(buyCount));

        await expect(
          lucky.connect(user1).buyTicketsWithNative(buyCount)
        ).to.be.revertedWith("Round has ended");
      });
      it("should revert if the Exceeds max tickets per user ", async function () {
        const {
          lucky,
          admin,
          user1,
          mockToken,
          duration,
          waitingTime,
          ticketPrice,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        const buyCount = 101;
        const totalCost =
          (await lucky.rounds(roundId)).ticketPrice * BigInt(buyCount);

        await expect(
          lucky
            .connect(user1)
            .buyTicketsWithNative(buyCount, { value: totalCost })
        ).to.be.revertedWith("Exceeds max tickets per user");
      });
      it("should revert if the Insufficient ETH sent", async function () {
        const {
          lucky,
          admin,
          user1,
          mockToken,
          duration,
          waitingTime,
          ticketPrice,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        const buyCount = 2;
        const totalCost =
          (await lucky.rounds(roundId)).ticketPrice * BigInt(buyCount);

        await expect(
          lucky
            .connect(user1)
            .buyTicketsWithNative(buyCount, { value: totalCost - BigInt(1) })
        ).to.be.revertedWith("Incorrect ETH amount sent");
      });
      it("should user as joined and unique players count increments", async function () {
        const {
          lucky,
          admin,
          user1,
          mockToken,
          duration,
          waitingTime,
          ticketPrice,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();
        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        expect((await lucky.rounds(roundId)).uniquePlayersCount).to.equal(0);
        expect(await lucky.hasJoined(roundId, user1.address)).to.equal(false);
        expect(await lucky.userTickets(roundId, user1.address)).to.equal(0);

        const buyCount = 1;
        const totalCost =
          (await lucky.rounds(roundId)).ticketPrice * BigInt(buyCount);

        await lucky
          .connect(user1)
          .buyTicketsWithNative(buyCount, { value: totalCost });

        expect(await lucky.hasJoined(roundId, user1.address)).to.equal(true);
        expect((await lucky.rounds(roundId)).uniquePlayersCount).to.equal(1);
        expect(await lucky.userTickets(roundId, user1.address)).to.equal(
          buyCount
        );
      });
      it("does not increment uniquePlayersCount when same user buys again", async function () {
        const {
          lucky,
          admin,
          user1,
          mockToken,
          duration,
          waitingTime,
          ticketPrice,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();
        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        await lucky
          .connect(user1)
          .buyTicketsWithNative(1, { value: ticketPrice });
        expect((await lucky.rounds(roundId)).uniquePlayersCount).to.equal(1);
        const more = 2;
        const moreCost = ticketPrice * BigInt(more);
        await lucky
          .connect(user1)
          .buyTicketsWithNative(more, { value: moreCost });

        expect((await lucky.rounds(roundId)).uniquePlayersCount).to.equal(1);
        expect(await lucky.userTickets(roundId, user1.address)).to.equal(
          1 + more
        );
      });
    });
    describe("checkUpkeep", function () {
      it("checkUpkeep retturn endRound when round is CREATED and time >= endTime", async function () {
        const { lucky, admin, duration, waitingTime } = await loadFixture(
          setup
        );
        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const { upkeepNeeded, performData } = await lucky.checkUpkeep(
          ethers.toUtf8Bytes("")
        );
        expect(upkeepNeeded).to.equal(true);
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["string"],
          performData
        );
        expect(decoded[0]).to.equal("endRound");
      });
      it("checkUpkeep returns (true, 'failRound') when round is ENDED, random requested and waitingTime passed and no winners", async function () {
        const {
          lucky,
          admin,
          user1,
          user2,
          user3,
          mockToken,
          duration,
          waitingTime,
          forwarder,
        } = await loadFixture(setup);
        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();
        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());
        for (const user of [user1, user2, user3]) {
          const price = (await lucky.rounds(roundId)).ticketPrice;
          await mockToken.connect(user).approve(lucky.getAddress(), price);
          await lucky.connect(user).buyTickets(1);
        }
        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await lucky.connect(forwarder).performUpkeep(performDataEnd);

        const rAfter = await lucky.rounds(roundId);
        expect(rAfter.status).to.equal(0);
        const rrTime = await lucky.roundRandomRequestTime(roundId);
        expect(rrTime).to.be.gt(0);

        const extra = Number(waitingTime) + 1;
        await network.provider.send("evm_increaseTime", [extra]);
        await network.provider.send("evm_mine");

        const result = await lucky.checkUpkeep("0x");
        const upkeepNeeded = result[0];
        const performData = result[1];

        expect(upkeepNeeded).to.equal(true);
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["string"],
          performData
        );
        expect(decoded[0]).to.equal("failRound");
      });
      it("checkUpkeep returns false immediately after endRound when waitingTime not yet passed", async function () {
        const {
          lucky,
          admin,
          user1,
          user2,
          user3,
          mockToken,
          duration,
          waitingTime,
          forwarder,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();
        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        for (const user of [user1, user2, user3]) {
          const price = (await lucky.rounds(roundId)).ticketPrice;
          await mockToken.connect(user).approve(lucky.getAddress(), price);
          await lucky.connect(user).buyTickets(1);
        }
        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");
        const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await lucky.connect(forwarder).performUpkeep(performDataEnd);

        const res = await lucky.checkUpkeep("0x");
        expect(res[0]).to.equal(false);
      });
      it("checkUpkeep returns (true, 'failRound') when round is ENDED, random requested and waitingTime passed and no winners (guide test)", async function () {
        const {
          lucky,
          admin,
          user1,
          user2,
          user3,
          mockToken,
          duration,
          waitingTime,
          forwarder,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());
        for (const user of [user1, user2, user3]) {
          const price = (await lucky.rounds(roundId)).ticketPrice;
          await mockToken.connect(user).approve(lucky.getAddress(), price);
          await lucky.connect(user).buyTickets(1);
        }
        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await lucky.connect(forwarder).performUpkeep(performDataEnd);

        const rAfter = await lucky.rounds(roundId);
        expect(rAfter.status).to.equal(0);
        const rrTime = await lucky.roundRandomRequestTime(roundId);
        expect(rrTime).to.be.gt(0);

        const extra = Number(waitingTime) + 1;
        await network.provider.send("evm_increaseTime", [extra]);
        await network.provider.send("evm_mine");

        const rRound = await lucky.rounds(roundId);
        expect(rRound.firstPrize).to.equal(ethers.ZeroAddress);
        expect(rRound.secondPrize).to.equal(ethers.ZeroAddress);
        expect(rRound.thirdPrize).to.equal(ethers.ZeroAddress);

        const result = await lucky.checkUpkeep("0x");
        expect(result[0]).to.equal(true);
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["string"],
          result[1]
        );
        expect(decoded[0]).to.equal("failRound");
      });
    });
    describe("performUpkeep", function () {
      it("should do nothing when action is unknown", async function () {
        const {
          lucky,
          admin,
          user1,
          mockToken,
          duration,
          waitingTime,
          forwarder,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .setRound(ethers.parseUnits("1", 18), duration, waitingTime);
        await lucky
          .connect(admin)
          .setRoundParameters(
            ethers.parseUnits("1000", 18),
            ethers.parseUnits("500", 18),
            ethers.parseUnits("250", 18),
            100,
            ethers.parseUnits("10", 18),
            ethers.parseUnits("5", 18),
            100
          );
        await lucky.connect(admin).setForwarder(forwarder.address);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();
        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        const performData = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["unknownAction"]
        );
        await expect(lucky.connect(forwarder).performUpkeep(performData)).to.not
          .be.reverted;

        const rAfter = await lucky.rounds(roundId);
        expect(rAfter.status).to.equal(1);
      });
      it("performUpkeep executes endRound correctly", async function () {
        const {
          lucky,
          admin,
          user1,
          user2,
          user3,
          mockToken,
          duration,
          waitingTime,
          forwarder,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        for (const user of [user1, user2, user3]) {
          const price = (await lucky.rounds(roundId)).ticketPrice;
          await mockToken.connect(user).approve(lucky.getAddress(), price);
          await lucky.connect(user).buyTickets(1);
        }

        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await expect(lucky.connect(forwarder).performUpkeep(performDataEnd)).to
          .not.be.reverted;

        const rAfter = await lucky.rounds(roundId);
        expect(rAfter.status).to.equal(0);
        const rrTime = await lucky.roundRandomRequestTime(roundId);
        expect(rrTime).to.be.gt(0);
      });
      it("should revert if the Not authorized caller", async function () {
        const { lucky, admin, user1, duration, waitingTime } =
          await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await expect(
          lucky.connect(user1).performUpkeep(performDataEnd)
        ).to.be.revertedWith("Not authorized");
      });
      it("should call endRound when uniquePlayersCount >= 3", async function () {
        const {
          lucky,
          admin,
          user1,
          user2,
          user3,
          mockToken,
          duration,
          waitingTime,
          forwarder,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        for (const user of [user1, user2, user3]) {
          const price = (await lucky.rounds(roundId)).ticketPrice;
          await mockToken.connect(user).approve(lucky.getAddress(), price);
          await lucky.connect(user).buyTickets(1);
        }

        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await expect(lucky.connect(forwarder).performUpkeep(performDataEnd)).to
          .not.be.reverted;

        const rAfter = await lucky.rounds(roundId);
        expect(rAfter.status).to.equal(0);
        const rrTime = await lucky.roundRandomRequestTime(roundId);
        expect(rrTime).to.be.gt(0);
      });
      it("should set round to FAILLED when uniquePlayersCount < 3", async function () {
        const {
          lucky,
          admin,
          user1,
          user2,
          mockToken,
          duration,
          waitingTime,
          forwarder,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .setRound(ethers.parseUnits("1", 18), duration, waitingTime);
        await lucky
          .connect(admin)
          .setRoundParameters(
            ethers.parseUnits("1000", 18),
            ethers.parseUnits("500", 18),
            ethers.parseUnits("250", 18),
            100,
            ethers.parseUnits("10", 18),
            ethers.parseUnits("5", 18),
            100
          );
        await lucky.connect(admin).setForwarder(forwarder.address);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        for (const user of [user1, user2]) {
          const price = (await lucky.rounds(roundId)).ticketPrice;
          await mockToken.connect(user).approve(lucky.getAddress(), price);
          await lucky.connect(user).buyTickets(1);
        }

        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await expect(lucky.connect(forwarder).performUpkeep(performDataEnd)).to
          .not.be.reverted;

        const rAfter = await lucky.rounds(roundId);
        expect(rAfter.status).to.equal(2);

        const newRoundId = await lucky.roundCounter();
        expect(newRoundId).to.equal(roundId + 1n);
        const newRound = await lucky.rounds(newRoundId);
        expect(newRound.status).to.equal(1);
      });
      it("should execute failRound action correctly", async function () {
        const {
          lucky,
          admin,
          user1,
          user2,
          user3,
          mockToken,
          duration,
          waitingTime,
          forwarder,
        } = await loadFixture(setup);

        // Set round parameters first
        await lucky
          .connect(admin)
          .setRound(ethers.parseUnits("1", 18), duration, waitingTime);
        await lucky
          .connect(admin)
          .setRoundParameters(
            ethers.parseUnits("1000", 18),
            ethers.parseUnits("500", 18),
            ethers.parseUnits("250", 18),
            100,
            ethers.parseUnits("10", 18),
            ethers.parseUnits("5", 18),
            100
          );
        await lucky.connect(admin).setForwarder(forwarder.address);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        for (const user of [user1, user2, user3]) {
          const price = (await lucky.rounds(roundId)).ticketPrice;
          await mockToken.connect(user).approve(lucky.getAddress(), price);
          await lucky.connect(user).buyTickets(1);
        }

        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await lucky.connect(forwarder).performUpkeep(performDataEnd);

        const rAfter = await lucky.rounds(roundId);
        expect(rAfter.status).to.equal(0);
        const rrTime = await lucky.roundRandomRequestTime(roundId);
        expect(rrTime).to.be.gt(0);

        const extra = Number(waitingTime) + 1;
        await network.provider.send("evm_increaseTime", [extra]);
        await network.provider.send("evm_mine");

        const performDataFail = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["failRound"]
        );

        await expect(lucky.connect(forwarder).performUpkeep(performDataFail))
          .to.emit(lucky, "RoundTimeout")
          .and.to.emit(lucky, "RoundFailed")
          .withArgs(roundId);

        const finalRound = await lucky.rounds(roundId);
        expect(finalRound.status).to.equal(2);
      });
      it("should create new round when failRound is called and prize tokens were deposited", async function () {
        const {
          lucky,
          admin,
          user1,
          user2,
          user3,
          mockToken,
          duration,
          waitingTime,
          forwarder,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .setRound(ethers.parseUnits("1", 18), duration, waitingTime);
        await lucky
          .connect(admin)
          .setRoundParameters(
            ethers.parseUnits("1000", 18),
            ethers.parseUnits("500", 18),
            ethers.parseUnits("250", 18),
            100,
            ethers.parseUnits("10", 18),
            ethers.parseUnits("5", 18),
            100
          );
        await lucky.connect(admin).setForwarder(forwarder.address);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        for (const user of [user1, user2, user3]) {
          const price = (await lucky.rounds(roundId)).ticketPrice;
          await mockToken.connect(user).approve(lucky.getAddress(), price);
          await lucky.connect(user).buyTickets(1);
        }

        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await lucky.connect(forwarder).performUpkeep(performDataEnd);

        const rAfter = await lucky.rounds(roundId);
        expect(rAfter.status).to.equal(0);
        const rrTime = await lucky.roundRandomRequestTime(roundId);
        expect(rrTime).to.be.gt(0);

        const extra = Number(waitingTime) + 1;
        await network.provider.send("evm_increaseTime", [extra]);
        await network.provider.send("evm_mine");

        const performDataFail = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["failRound"]
        );

        const roundCounterBefore = await lucky.roundCounter();

        await expect(lucky.connect(forwarder).performUpkeep(performDataFail))
          .to.emit(lucky, "RoundTimeout")
          .and.to.emit(lucky, "RoundFailed")
          .withArgs(roundId)
          .and.to.emit(lucky, "RoundCreated");

        const finalRound = await lucky.rounds(roundId);
        expect(finalRound.status).to.equal(2);

        const roundCounterAfter = await lucky.roundCounter();
        expect(roundCounterAfter).to.equal(roundCounterBefore + 1n);

        const newRound = await lucky.rounds(roundCounterAfter);
        expect(newRound.status).to.equal(1);
      });
      describe("endRound", function () {
        it("should endRound successfully when uniquePlayersCount >= 3", async function () {
          const {
            lucky,
            admin,
            user1,
            user2,
            user3,
            mockToken,
            duration,
            waitingTime,
            forwarder,
          } = await loadFixture(setup);

          await lucky
            .connect(admin)
            .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
          const roundId = await lucky.roundCounter();

          const round = await lucky.rounds(roundId);
          const totalPrizeTokens =
            round.firstPrizeTokenAmount +
            round.secondPrizeTokenAmount +
            round.thirdPrizeTokenAmount;
          await mockToken
            .connect(admin)
            .approve(lucky.getAddress(), totalPrizeTokens);
          await lucky
            .connect(admin)
            .depositPrizeTokens(roundId, await mockToken.getAddress());

          for (const user of [user1, user2, user3]) {
            const price = (await lucky.rounds(roundId)).ticketPrice;
            await mockToken.connect(user).approve(lucky.getAddress(), price);
            await lucky.connect(user).buyTickets(1);
          }
          await network.provider.send("evm_increaseTime", [duration + 1]);
          await network.provider.send("evm_mine");
          const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
            ["string"],
            ["endRound"]
          );
          await expect(lucky.connect(forwarder).performUpkeep(performDataEnd))
            .to.not.be.reverted;
          const rAfter = await lucky.rounds(roundId);
          expect(rAfter.status).to.equal(0);
          const rrTime = await lucky.roundRandomRequestTime(roundId);
          expect(rrTime).to.be.gt(0);
        });
        it("should execute failRound and create new round when prize tokens were deposited", async function () {
          const {
            lucky,
            admin,
            user1,
            user2,
            user3,
            mockToken,
            duration,
            waitingTime,
            forwarder,
          } = await loadFixture(setup);

          await lucky
            .connect(admin)
            .setRound(ethers.parseUnits("1", 18), duration, waitingTime);
          await lucky
            .connect(admin)
            .setRoundParameters(
              ethers.parseUnits("1000", 18),
              ethers.parseUnits("500", 18),
              ethers.parseUnits("250", 18),
              100,
              ethers.parseUnits("10", 18),
              ethers.parseUnits("5", 18),
              100
            );
          await lucky.connect(admin).setForwarder(forwarder.address);

          await lucky
            .connect(admin)
            .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
          const roundId = await lucky.roundCounter();

          const round = await lucky.rounds(roundId);
          const totalPrizeTokens =
            round.firstPrizeTokenAmount +
            round.secondPrizeTokenAmount +
            round.thirdPrizeTokenAmount;
          await mockToken
            .connect(admin)
            .approve(lucky.getAddress(), totalPrizeTokens);
          await lucky
            .connect(admin)
            .depositPrizeTokens(roundId, await mockToken.getAddress());

          for (const user of [user1, user2, user3]) {
            const price = (await lucky.rounds(roundId)).ticketPrice;
            await mockToken.connect(user).approve(lucky.getAddress(), price);
            await lucky.connect(user).buyTickets(1);
          }

          await network.provider.send("evm_increaseTime", [duration + 1]);
          await network.provider.send("evm_mine");

          const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
            ["string"],
            ["endRound"]
          );
          await lucky.connect(forwarder).performUpkeep(performDataEnd);

          const rAfter = await lucky.rounds(roundId);
          expect(rAfter.status).to.equal(0);
          const rrTime = await lucky.roundRandomRequestTime(roundId);
          expect(rrTime).to.be.gt(0);

          const extra = Number(waitingTime) + 1;
          await network.provider.send("evm_increaseTime", [extra]);
          await network.provider.send("evm_mine");

          const performDataFail = ethers.AbiCoder.defaultAbiCoder().encode(
            ["string"],
            ["failRound"]
          );

          const roundCounterBefore = await lucky.roundCounter();

          await expect(lucky.connect(forwarder).performUpkeep(performDataFail))
            .to.emit(lucky, "RoundTimeout")
            .and.to.emit(lucky, "RoundFailed")
            .withArgs(roundId)
            .and.to.emit(lucky, "RoundCreated");

          const finalRound = await lucky.rounds(roundId);
          expect(finalRound.status).to.equal(2);

          const roundCounterAfter = await lucky.roundCounter();
          expect(roundCounterAfter).to.equal(roundCounterBefore + 1n);

          const newRound = await lucky.rounds(roundCounterAfter);
          expect(newRound.status).to.equal(1);
        });
      });
      describe("requestRandomWords", function () {
        it("should revert requestRandomWords when round is not ENDED", async function () {
          const {
            lucky,
            admin,
            user1,
            user2,
            user3,
            mockToken,
            duration,
            waitingTime,
            forwarder,
          } = await loadFixture(setup);

          await lucky
            .connect(admin)
            .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
          const roundId = await lucky.roundCounter();

          const round = await lucky.rounds(roundId);
          const totalPrizeTokens =
            round.firstPrizeTokenAmount +
            round.secondPrizeTokenAmount +
            round.thirdPrizeTokenAmount;
          await mockToken
            .connect(admin)
            .approve(lucky.getAddress(), totalPrizeTokens);
          await lucky
            .connect(admin)
            .depositPrizeTokens(roundId, await mockToken.getAddress());

          for (const user of [user1, user2, user3]) {
            const price = (await lucky.rounds(roundId)).ticketPrice;
            await mockToken.connect(user).approve(lucky.getAddress(), price);
            await lucky.connect(user).buyTickets(1);
          }

          const currentRound = await lucky.rounds(roundId);
          expect(currentRound.status).to.equal(1);

          const keyHash =
            "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
          const subscriptionId = 1;
          const callbackGasLimit = 2500000;
          const numWords = 3;
          const requestConfirmations = 3;

          await expect(
            lucky
              .connect(admin)
              .requestRandomWords(
                keyHash,
                subscriptionId,
                callbackGasLimit,
                numWords,
                requestConfirmations
              )
          ).to.be.revertedWith("Round not ended");
        });
        it("should revert requestRandomWords when called by non-owner", async function () {
          const {
            lucky,
            admin,
            user1,
            user2,
            user3,
            mockToken,
            duration,
            waitingTime,
            forwarder,
          } = await loadFixture(setup);

          await lucky
            .connect(admin)
            .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
          const roundId = await lucky.roundCounter();

          const round = await lucky.rounds(roundId);
          const totalPrizeTokens =
            round.firstPrizeTokenAmount +
            round.secondPrizeTokenAmount +
            round.thirdPrizeTokenAmount;
          await mockToken
            .connect(admin)
            .approve(lucky.getAddress(), totalPrizeTokens);
          await lucky
            .connect(admin)
            .depositPrizeTokens(roundId, await mockToken.getAddress());

          for (const user of [user1, user2, user3]) {
            const price = (await lucky.rounds(roundId)).ticketPrice;
            await mockToken.connect(user).approve(lucky.getAddress(), price);
            await lucky.connect(user).buyTickets(1);
          }

          await network.provider.send("evm_increaseTime", [duration + 1]);
          await network.provider.send("evm_mine");

          const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
            ["string"],
            ["endRound"]
          );
          await lucky.connect(forwarder).performUpkeep(performDataEnd);

          const rAfter = await lucky.rounds(roundId);
          expect(rAfter.status).to.equal(0);

          const keyHash =
            "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
          const subscriptionId = 1;
          const callbackGasLimit = 2500000;
          const numWords = 3;
          const requestConfirmations = 3;

          await expect(
            lucky
              .connect(user1)
              .requestRandomWords(
                keyHash,
                subscriptionId,
                callbackGasLimit,
                numWords,
                requestConfirmations
              )
          ).to.be.revertedWith("Not authorized");
        });
      });
      describe("fulfillRandomWords", function () {
        it("should fulfill random words and pick winners", async function () {
          const {
            lucky,
            admin,
            user1,
            user2,
            user3,
            mockToken,
            vrfCoordinatorV2_5Mock,
            duration,
            waitingTime,
            forwarder,
          } = await loadFixture(setup);

          await lucky
            .connect(admin)
            .setRound(ethers.parseUnits("1", 18), duration, waitingTime);
          await lucky
            .connect(admin)
            .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
          const roundId = await lucky.roundCounter();

          const round = await lucky.rounds(roundId);
          const totalPrizeTokens =
            round.firstPrizeTokenAmount +
            round.secondPrizeTokenAmount +
            round.thirdPrizeTokenAmount;
          await mockToken
            .connect(admin)
            .approve(lucky.getAddress(), totalPrizeTokens);
          await lucky
            .connect(admin)
            .depositPrizeTokens(roundId, await mockToken.getAddress());

          for (const user of [user1, user2, user3]) {
            const price = (await lucky.rounds(roundId)).ticketPrice;
            await mockToken.connect(user).approve(lucky.getAddress(), price);
            await lucky.connect(user).buyTickets(1);
          }

          await network.provider.send("evm_increaseTime", [duration + 1]);
          await network.provider.send("evm_mine");

          const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
            ["string"],
            ["endRound"]
          );
          await lucky.connect(forwarder).performUpkeep(performDataEnd);

          const rAfter = await lucky.rounds(roundId);
          expect(rAfter.status).to.equal(0); // ENDED
          const rrTime = await lucky.roundRandomRequestTime(roundId);
          expect(rrTime).to.be.gt(0);

          const requestId = roundId;

          await expect(
            vrfCoordinatorV2_5Mock.fulfillRandomWords(
              requestId,
              lucky.getAddress()
            )
          ).to.not.be.reverted;

          const finalRound = await lucky.rounds(roundId);
          expect(finalRound.firstPrize).to.not.equal(ethers.ZeroAddress);
          expect(finalRound.secondPrize).to.not.equal(ethers.ZeroAddress);
          expect(finalRound.thirdPrize).to.not.equal(ethers.ZeroAddress);
        });
      });
      describe("claimRefund", function () {
        it("should allow users to claim refund when round failed", async function () {
          const {
            lucky,
            admin,
            user1,
            user2,
            mockToken,
            duration,
            waitingTime,
            forwarder,
          } = await loadFixture(setup);

          await lucky
            .connect(admin)
            .setRound(ethers.parseUnits("1", 18), duration, waitingTime);
          await lucky
            .connect(admin)
            .setRoundParameters(
              ethers.parseUnits("1000", 18),
              ethers.parseUnits("500", 18),
              ethers.parseUnits("250", 18),
              100,
              ethers.parseUnits("10", 18),
              ethers.parseUnits("5", 18),
              100
            );
          await lucky.connect(admin).setForwarder(forwarder.address);

          await lucky
            .connect(admin)
            .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
          const roundId = await lucky.roundCounter();

          const round = await lucky.rounds(roundId);
          const totalPrizeTokens =
            round.firstPrizeTokenAmount +
            round.secondPrizeTokenAmount +
            round.thirdPrizeTokenAmount;
          await mockToken
            .connect(admin)
            .approve(lucky.getAddress(), totalPrizeTokens);
          await lucky
            .connect(admin)
            .depositPrizeTokens(roundId, await mockToken.getAddress());

          for (const user of [user1, user2]) {
            const price = (await lucky.rounds(roundId)).ticketPrice;
            await mockToken.connect(user).approve(lucky.getAddress(), price);
            await lucky.connect(user).buyTickets(1);
          }

          await network.provider.send("evm_increaseTime", [duration + 1]);
          await network.provider.send("evm_mine");

          const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
            ["string"],
            ["endRound"]
          );
          await expect(lucky.connect(forwarder).performUpkeep(performDataEnd))
            .to.not.be.reverted;

          const rAfter = await lucky.rounds(roundId);
          expect(rAfter.status).to.equal(2); // FAILED

          for (const user of [user1, user2]) {
            const balanceBefore = await mockToken.balanceOf(user.address);
            await lucky.connect(user).claimRefund(roundId);
            const balanceAfter = await mockToken.balanceOf(user.address);
            expect(balanceAfter).to.equal(
              balanceBefore + (await lucky.rounds(roundId)).ticketPrice
            );
          }
        });
        it("should revert if the Invalid round ID", async function () {
          const { lucky, admin, user1 } = await loadFixture(setup);

          await expect(
            lucky.connect(user1).claimRefund(999)
          ).to.be.revertedWith("Invalid round ID");
        });
        it("should revert if the Round not failed", async function () {
          const {
            lucky,
            admin,
            user1,
            mockToken,
            duration,
            waitingTime,
            forwarder,
          } = await loadFixture(setup);

          await lucky
            .connect(admin)
            .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
          const roundId = await lucky.roundCounter();

          const round = await lucky.rounds(roundId);
          const totalPrizeTokens =
            round.firstPrizeTokenAmount +
            round.secondPrizeTokenAmount +
            round.thirdPrizeTokenAmount;
          await mockToken
            .connect(admin)
            .approve(lucky.getAddress(), totalPrizeTokens);
          await lucky
            .connect(admin)
            .depositPrizeTokens(roundId, await mockToken.getAddress());

          const price = (await lucky.rounds(roundId)).ticketPrice;
          await mockToken.connect(user1).approve(lucky.getAddress(), price);
          await lucky.connect(user1).buyTickets(1);

          await expect(
            lucky.connect(user1).claimRefund(roundId)
          ).to.be.revertedWith("Round not failed");
        });
        it("should revert if the No tickets TicketPurchased", async function () {
          const {
            lucky,
            admin,
            user1,
            mockToken,
            duration,
            waitingTime,
            forwarder,
          } = await loadFixture(setup);
          await lucky
            .connect(admin)
            .setRound(ethers.parseUnits("1", 18), duration, waitingTime);

          await lucky
            .connect(admin)
            .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
          const roundId = await lucky.roundCounter();

          const round = await lucky.rounds(roundId);
          const totalPrizeTokens =
            round.firstPrizeTokenAmount +
            round.secondPrizeTokenAmount +
            round.thirdPrizeTokenAmount;
          await mockToken
            .connect(admin)
            .approve(lucky.getAddress(), totalPrizeTokens);
          await lucky
            .connect(admin)
            .depositPrizeTokens(roundId, await mockToken.getAddress());

          await network.provider.send("evm_increaseTime", [duration + 1]);
          await network.provider.send("evm_mine");

          const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
            ["string"],
            ["endRound"]
          );
          await expect(lucky.connect(forwarder).performUpkeep(performDataEnd))
            .to.not.be.reverted;

          const rAfter = await lucky.rounds(roundId);
          expect(rAfter.status).to.equal(2);

          await expect(
            lucky.connect(user1).claimRefund(roundId)
          ).to.be.revertedWith("No tickets purchased");
        });
        it("should revert if the Refund already claimed", async function () {
          const {
            lucky,
            admin,
            user1,
            user2,
            mockToken,
            duration,
            waitingTime,
            forwarder,
          } = await loadFixture(setup);
          await lucky
            .connect(admin)
            .setRound(ethers.parseUnits("1", 18), duration, waitingTime);
          await lucky
            .connect(admin)
            .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
          const roundId = await lucky.roundCounter();

          const round = await lucky.rounds(roundId);
          const totalPrizeTokens =
            round.firstPrizeTokenAmount +
            round.secondPrizeTokenAmount +
            round.thirdPrizeTokenAmount;
          await mockToken
            .connect(admin)
            .approve(lucky.getAddress(), totalPrizeTokens);
          await lucky
            .connect(admin)
            .depositPrizeTokens(roundId, await mockToken.getAddress());

          for (const user of [user1, user2]) {
            const price = (await lucky.rounds(roundId)).ticketPrice;
            await mockToken.connect(user).approve(lucky.getAddress(), price);
            await lucky.connect(user).buyTickets(1);
          }

          await network.provider.send("evm_increaseTime", [duration + 1]);
          await network.provider.send("evm_mine");

          const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
            ["string"],
            ["endRound"]
          );
          await expect(lucky.connect(forwarder).performUpkeep(performDataEnd))
            .to.not.be.reverted;

          const rAfter = await lucky.rounds(roundId);
          expect(rAfter.status).to.equal(2);

          await lucky.connect(user1).claimRefund(roundId);

          await expect(
            lucky.connect(user1).claimRefund(roundId)
          ).to.be.revertedWith("Refund already claimed");
        });
      });
    });
    describe("refundPrizeTokensOnFailed", function () {
      it("should refund prize tokens to admin on failed round", async function () {
        const {
          lucky,
          admin,
          user1,
          user2,
          mockToken,
          duration,
          waitingTime,
          forwarder,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .setRound(ethers.parseUnits("1", 18), duration, waitingTime);
        await lucky
          .connect(admin)
          .setRoundParameters(
            ethers.parseUnits("1000", 18),
            ethers.parseUnits("500", 18),
            ethers.parseUnits("250", 18),
            100,
            ethers.parseUnits("10", 18),
            ethers.parseUnits("5", 18),
            100
          );
        await lucky.connect(admin).setForwarder(forwarder.address);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        for (const user of [user1, user2]) {
          const price = (await lucky.rounds(roundId)).ticketPrice;
          await mockToken.connect(user).approve(lucky.getAddress(), price);
          await lucky.connect(user).buyTickets(1);
        }

        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await expect(lucky.connect(forwarder).performUpkeep(performDataEnd)).to
          .not.be.reverted;

        const rAfter = await lucky.rounds(roundId);
        expect(rAfter.status).to.equal(2); // FAILED

        const adminBalanceBefore = await mockToken.balanceOf(admin.address);
        await lucky.connect(admin).refundPrizeTokensOnFailed(roundId);
        const adminBalanceAfter = await mockToken.balanceOf(admin.address);
        expect(adminBalanceAfter).to.equal(
          adminBalanceBefore + totalPrizeTokens
        );

        await expect(
          lucky.connect(admin).refundPrizeTokensOnFailed(roundId)
        ).to.be.revertedWith("Already refunded");
      });
      it("should revert if the caller is not admin", async function () {
        const { lucky, admin, user1 } = await loadFixture(setup);

        await expect(
          lucky.connect(user1).refundPrizeTokensOnFailed(1)
        ).to.be.revertedWith("Only callable by owner");
      });
      it("should revert if the Round not failed ", async function () {
        const { lucky, admin } = await loadFixture(setup);

        await expect(
          lucky.connect(admin).refundPrizeTokensOnFailed(1)
        ).to.be.revertedWith("Round not failed");
      });
      it("should revert if the Prize not deposited", async function () {
        const { lucky, admin, duration, waitingTime, forwarder } =
          await loadFixture(setup);

        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");
        const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await lucky.connect(forwarder).performUpkeep(performDataEnd);

        await expect(
          lucky.connect(admin).refundPrizeTokensOnFailed(roundId)
        ).to.be.revertedWith("Prize not deposited");
      });
    });
    describe("checkOwnPrizes", function () {
      it("should checkOwnPrizes correctly", async function () {
        const {
          lucky,
          admin,
          user1,
          user2,
          user3,
          mockToken,
          vrfCoordinatorV2_5Mock,
          duration,
          waitingTime,
          forwarder,
        } = await loadFixture(setup);

        await lucky
          .connect(admin)
          .setRound(ethers.parseUnits("1", 18), duration, waitingTime);
        await lucky
          .connect(admin)
          .createRound(duration, waitingTime, ethers.parseUnits("1", 18));
        const roundId = await lucky.roundCounter();

        const round = await lucky.rounds(roundId);
        const totalPrizeTokens =
          round.firstPrizeTokenAmount +
          round.secondPrizeTokenAmount +
          round.thirdPrizeTokenAmount;
        await mockToken
          .connect(admin)
          .approve(lucky.getAddress(), totalPrizeTokens);
        await lucky
          .connect(admin)
          .depositPrizeTokens(roundId, await mockToken.getAddress());

        for (const user of [user1, user2, user3]) {
          const price = (await lucky.rounds(roundId)).ticketPrice;
          await mockToken.connect(user).approve(lucky.getAddress(), price);
          await lucky.connect(user).buyTickets(1);
        }

        await network.provider.send("evm_increaseTime", [duration + 1]);
        await network.provider.send("evm_mine");

        const performDataEnd = ethers.AbiCoder.defaultAbiCoder().encode(
          ["string"],
          ["endRound"]
        );
        await lucky.connect(forwarder).performUpkeep(performDataEnd);
        const requestId = roundId;

        await vrfCoordinatorV2_5Mock.fulfillRandomWords(
          requestId,
          lucky.getAddress()
        );

        const user1Prizes = await lucky.connect(user1).checkOwnPrizes(roundId);
        const user2Prizes = await lucky.connect(user2).checkOwnPrizes(roundId);
        const user3Prizes = await lucky.connect(user3).checkOwnPrizes(roundId);

        const allWinners = [
          (await lucky.rounds(roundId)).firstPrize,
          (await lucky.rounds(roundId)).secondPrize,
          (await lucky.rounds(roundId)).thirdPrize,
        ];

        if (allWinners.includes(user1.address)) {
          expect(user1Prizes.length).to.be.greaterThan(0);
        } else {
          expect(user1Prizes.length).to.equal(0);
        }

        if (allWinners.includes(user2.address)) {
          expect(user2Prizes.length).to.be.greaterThan(0);
        } else {
          expect(user2Prizes.length).to.equal(0);
        }

        if (allWinners.includes(user3.address)) {
          expect(user3Prizes.length).to.be.greaterThan(0);
        } else {
          expect(user3Prizes.length).to.equal(0);
        }
      });
      it("should revert if the Invalid round ID", async function () {
        const { lucky, user1 } = await loadFixture(setup);

        await expect(
          lucky.connect(user1).checkOwnPrizes(999)
        ).to.be.revertedWith("Invalid round ID");
      });
    });
  });
});
