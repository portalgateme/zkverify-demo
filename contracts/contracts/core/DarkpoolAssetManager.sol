// SPDX-License-Identifier: MIT

pragma solidity >=0.8.20;

import {BaseAssetManager} from "./base/BaseAssetManager.sol";
import {BaseInputBuilder} from "./base/BaseInputBuilder.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IZKHub} from "./interfaces/IZKHub.sol";

/**
 * @title DarkpoolAssetManager
 * @dev Asset manager for deposit.
 */
contract DarkpoolAssetManager is BaseInputBuilder, BaseAssetManager {
    using SafeERC20 for IERC20;

    bytes32 public constant DEPOSIT_VERIFIER_ID =
        keccak256(abi.encode("deposit"));

    mapping(bytes32 => bool) public noteCommitments;
    mapping(bytes32 => bool) public noteFooters;

    event Deposit(
        address depositor,
        bytes32 noteOut,
        uint256 amount,
        address asset
    );

    constructor(
        address assetPoolERC20,
        address assetPoolERC721,
        address assetPoolETH,
        address relayerHub,
        address feeManager,
        address comlianceManager,
        address mimc254,
        address zkHub,
        address noteManager,
        address initialOwner
    )
        BaseAssetManager(
            assetPoolERC20,
            assetPoolERC721,
            assetPoolETH,
            relayerHub,
            feeManager,
            comlianceManager,
            mimc254,
            zkHub,
            noteManager,
            initialOwner
        )
        BaseInputBuilder(P)
    {}

    /**
     * @dev Function to deposit ERC20 tokens, guarded by the compliance manager.
     * @param _asset Address of the ERC20 token.
     * @param _amount Amount of ERC20 tokens to be deposited.
     * @param _noteCommitment Deposit note for commiting to the merkle tree.
     * @param _attDetails Attestation proof details.
     */
    function depositERC20(
        address _asset,
        uint256 _amount,
        bytes32 _noteCommitment,
        bytes32 _noteFooter,
        IZKHub.AttestationDetails memory _attDetails
    ) public {
        require(
            _complianceManager.isAuthorized(address(this), msg.sender),
            "BaseAssetManager: invalid credential"
        );

        _validateNoteIsNotRegistered(_noteCommitment);
        _validateNoteFooterIsNotRegistered(_noteFooter);

        bytes32[] memory _publicInputs = new bytes32[](5);
        _publicInputs[0] = _bytifyToNoir(msg.sender);
        _publicInputs[1] = _noteCommitment;
        _publicInputs[2] = _bytifyToNoir(_asset);
        _publicInputs[3] = bytes32(_amount);
        _publicInputs[4] = _noteFooter;

        IZKHub.VerifyDetails memory verifyDetails = IZKHub.VerifyDetails(
            uint256(DEPOSIT_VERIFIER_ID),
            _publicInputs
        );

        _postDeposit(_noteCommitment, _noteFooter);

        IERC20(_asset).safeTransferFrom(
            msg.sender,
            address(_assetPoolERC20),
            _amount
        );

        bool proofValid = _zkHub.verifyProof(_attDetails, verifyDetails);
        require(proofValid, "DarkpoolAssetManager: invalid deposit proof");

        emit Deposit(msg.sender, _noteCommitment, _amount, _asset);
    }

    /**
     * @dev Function to deposit ETH, guarded by the compliance manager.
     * @param _noteCommitment Deposit note for commiting to the merkle tree.
     * @param _noteFooter Footer of the note.
     * @param _attDetails Attestation proof details.
     */
    function depositETH(
        bytes32 _noteCommitment,
        bytes32 _noteFooter,
        IZKHub.AttestationDetails memory _attDetails
    ) public payable {
        require(
            _complianceManager.isAuthorized(address(this), msg.sender),
            "BaseAssetManager: invalid credential"
        );

        _validateNoteIsNotRegistered(_noteCommitment);
        _validateNoteFooterIsNotRegistered(_noteFooter);

        bytes32[] memory _publicInputs = new bytes32[](5);
        _publicInputs[0] = _bytifyToNoir(msg.sender);
        _publicInputs[1] = _noteCommitment;
        _publicInputs[2] = _bytifyToNoir(ETH_ADDRESS);
        _publicInputs[3] = bytes32(msg.value);
        _publicInputs[4] = _noteFooter;

        IZKHub.VerifyDetails memory verifyDetails = IZKHub.VerifyDetails(
            uint256(DEPOSIT_VERIFIER_ID),
            _publicInputs
        );

        _postDeposit(_noteCommitment, _noteFooter);

        (bool success, ) = address(_assetPoolETH).call{value: msg.value}("");
        require(success, "depositETH: transfer failed");

        bool proofValid = _zkHub.verifyProof(_attDetails, verifyDetails);
        require(proofValid, "DarkpoolAssetManager: invalid deposit proof");

        emit Deposit(msg.sender, _noteCommitment, msg.value, ETH_ADDRESS);
    }
}
