// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {IVRFMigratableConsumerV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFMigratableConsumerV2Plus.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ConfirmedOwnerUpgradeable} from "./ConfirmedOwner/ConfirmedOwnerUpgradeable.sol";

/** ****************************************************************************
 * @notice Interface for contracts using VRF randomness
 * *****************************************************************************
 */
abstract contract VRFConsumerBaseV2PlusUpgradeable is
    IVRFMigratableConsumerV2Plus,
    Initializable,
    ConfirmedOwnerUpgradeable
{
    error OnlyCoordinatorCanFulfill(address have, address want);
    error OnlyOwnerOrCoordinator(
        address have,
        address owner,
        address coordinator
    );
    error ZeroAddress();

    // s_vrfCoordinator should be used by consumers to make requests to vrfCoordinator
    IVRFCoordinatorV2Plus public s_vrfCoordinator;

    /**
     * @notice Initialize the contract with VRFCoordinator address
     * @param _vrfCoordinator address of VRFCoordinator contract
     */
    function __VRFConsumerBaseV2Plus_init(
        address _vrfCoordinator
    ) internal onlyInitializing {
        __ConfirmedOwner_init(msg.sender);
        if (_vrfCoordinator == address(0)) {
            revert ZeroAddress();
        }
        s_vrfCoordinator = IVRFCoordinatorV2Plus(_vrfCoordinator);
    }

    /**
     * @notice fulfillRandomness handles the VRF response. Your contract must
     * @notice implement it. See "SECURITY CONSIDERATIONS" above for important
     * @notice principles to keep in mind when implementing your fulfillRandomness
     * @notice method.
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal virtual;

    /**
     * @notice rawFulfillRandomness is called by VRFCoordinator when it receives a valid VRF
     * @notice proof. rawFulfillRandomness then calls fulfillRandomness, after validating
     * @notice the origin of the call.
     */
    function rawFulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) external {
        if (msg.sender != address(s_vrfCoordinator)) {
            revert OnlyCoordinatorCanFulfill(
                msg.sender,
                address(s_vrfCoordinator)
            );
        }
        fulfillRandomWords(requestId, randomWords);
    }

    /**
     * @inheritdoc IVRFMigratableConsumerV2Plus
     */
    function setCoordinator(
        address _vrfCoordinator
    ) external override onlyOwnerOrCoordinator {
        if (_vrfCoordinator == address(0)) {
            revert ZeroAddress();
        }
        s_vrfCoordinator = IVRFCoordinatorV2Plus(_vrfCoordinator);

        emit CoordinatorSet(_vrfCoordinator);
    }

    modifier onlyOwnerOrCoordinator() {
        if (msg.sender != owner() && msg.sender != address(s_vrfCoordinator)) {
            revert OnlyOwnerOrCoordinator(
                msg.sender,
                owner(),
                address(s_vrfCoordinator)
            );
        }
        _;
    }
}
