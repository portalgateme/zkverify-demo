// SPDX-License-Identifier: MIT

pragma solidity >=0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IAssetPool} from "../interfaces/IAssetPool.sol";
import {IRelayerHub} from "../interfaces/IRelayerHub.sol";
import {IFeeManager} from "../interfaces/IFeeManager.sol";
import {IComplianceManager} from "../interfaces/IComplianceManager.sol";
import {BaseInputBuilder} from "./BaseInputBuilder.sol";
import {IZKHub} from "../interfaces/IZKHub.sol";
import {IMimc254} from "../interfaces/IMimc254.sol";
import {INoteManager} from "../interfaces/INoteManager.sol";

/**
 * @title BaseAssetManager
 * @dev Base contract for asset managers.
 */
abstract contract BaseAssetManager is Ownable, BaseInputBuilder {
    using SafeERC20 for IERC20;

    struct FundReleaseDetails {
        address assetAddress;
        address payable recipient;
        address payable relayer;
        uint256 relayerGasFee;
        uint256 amount;
    }

    IZKHub internal _zkHub;
    IMimc254 internal _mimc254;
    IAssetPool internal _assetPoolERC20;
    IAssetPool internal _assetPoolERC721;
    IAssetPool internal _assetPoolETH;
    IRelayerHub internal _relayerHub;
    IFeeManager internal _feeManager;
    IComplianceManager internal _complianceManager;
    INoteManager internal _noteManager;

    address public constant ETH_ADDRESS =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    bytes32 public constant ASSET_ETH = keccak256(abi.encode(ETH_ADDRESS));

    uint256 public constant P =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;

    error RelayerNotRegistered();
    error NullifierUsed();
    error NullifierLocked();
    error MerkleRootNotAllowed();
    error NoteFooterUsed();
    error NoteAlreadyCreated();
    error NoteNotCreated();
    error InvalidNoteParameters();
    error ZeroAddress();
    error NoteFooterDuplicated();
    error RelayerMismatch();

    // we dont use it for now
    modifier onlyETHAssetPool() {
        require(
            msg.sender == address(_assetPoolETH),
            "BaseAssetManager: Only ETH Asset Pool"
        );
        _;
    }

    constructor(
        address assetPoolERC20,
        address assetPoolERC721,
        address assetPoolETH,
        address relayerHub,
        address feeManager,
        address complianceManager,
        address mimc254,
        address zkHub,
        address noteManager,
        address initialOwner
    ) Ownable(initialOwner) {
        if (
            assetPoolERC20 == address(0) ||
            assetPoolERC721 == address(0) ||
            assetPoolETH == address(0) ||
            relayerHub == address(0) ||
            feeManager == address(0) ||
            complianceManager == address(0) ||
            initialOwner == address(0) ||
            mimc254 == address(0) ||
            zkHub == address(0) ||
            noteManager == address(0)
        ) {
            revert ZeroAddress();
        }
        _assetPoolERC20 = IAssetPool(assetPoolERC20);
        _assetPoolERC721 = IAssetPool(assetPoolERC721);
        _assetPoolETH = IAssetPool(assetPoolETH);
        _zkHub = IZKHub(zkHub);
        _mimc254 = IMimc254(mimc254);
        _relayerHub = IRelayerHub(relayerHub);
        _feeManager = IFeeManager(feeManager);
        _complianceManager = IComplianceManager(complianceManager);
        _noteManager = INoteManager(noteManager);
    }

    receive() external payable {}

    /**
     * @dev Transfers the asset to the asset pool if there are
     *      any remaining assets due to network failures.
     */
    function releaseToAsssetPool(
        address asset,
        uint256 amount
    ) external onlyOwner {
        require(amount > 0, "BaseAssetManager: amount must be greater than 0");
        if (asset == address(0) || asset == ETH_ADDRESS) {
            (bool success, ) = address(_assetPoolETH).call{value: amount}("");
            require(success, "BaseAssetManager: Failed to send Ether");
        } else {
            IERC20(asset).safeTransfer(address(_assetPoolERC20), amount);
        }
    }

    function setAssetPoolERC20(address assetPoolERC20) public onlyOwner {
        if (assetPoolERC20 != address(0)) {
            _assetPoolERC20 = IAssetPool(assetPoolERC20);
        }
    }

    function setAssetPoolERC721(address assetPoolERC721) public onlyOwner {
        if (assetPoolERC721 != address(0)) {
            _assetPoolERC721 = IAssetPool(assetPoolERC721);
        }
    }

    function setAssetPoolETH(address assetPoolETH) public onlyOwner {
        if (assetPoolETH != address(0)) {
            _assetPoolETH = IAssetPool(assetPoolETH);
        }
    }

    function setRelayerHub(address relayerHub) public onlyOwner {
        if (relayerHub != address(0)) {
            _relayerHub = IRelayerHub(relayerHub);
        }
    }

    function setFeeManager(address feeManager) public onlyOwner {
        if (feeManager != address(0)) {
            _feeManager = IFeeManager(feeManager);
        }
    }

    function setComplianceManager(address complianceManager) public onlyOwner {
        if (complianceManager != address(0)) {
            _complianceManager = IComplianceManager(complianceManager);
        }
    }

    function getAssetPoolERC20() public view returns (address) {
        return address(_assetPoolERC20);
    }

    function getAssetPoolERC721() public view returns (address) {
        return address(_assetPoolERC721);
    }

    function getAssetPoolETH() public view returns (address) {
        return address(_assetPoolETH);
    }

    function getRelayerHub() public view returns (address) {
        return address(_relayerHub);
    }

    function getFeeManager() public view returns (address) {
        return address(_feeManager);
    }

    function getComplianceManager() public view returns (address) {
        return address(_complianceManager);
    }

    function _releaseERC20WithFee(
        address _asset,
        address _to,
        address _relayer,
        uint256 _relayerGasFee,
        uint256 _amount
    ) internal returns (uint256, uint256, uint256) {
        (
            uint256 actualAmount,
            uint256 serviceFee,
            uint256 relayerRefund
        ) = _feeManager.calculateFee(_amount, _relayerGasFee);

        _assetPoolERC20.release(_asset, _to, actualAmount);

        if (relayerRefund > 0) {
            _assetPoolERC20.release(_asset, _relayer, relayerRefund);
        }
        if (serviceFee > 0) {
            _assetPoolERC20.release(_asset, address(_feeManager), serviceFee);
        }

        return (actualAmount, serviceFee, relayerRefund);
    }

    function _releaseETHWithFee(
        address payable _to,
        address payable _relayer,
        uint256 _relayerGasFee,
        uint256 _amount
    ) internal returns (uint256, uint256, uint256) {
        (
            uint256 actualAmount,
            uint256 serviceFee,
            uint256 relayerRefund
        ) = _feeManager.calculateFee(_amount, _relayerGasFee);

        _assetPoolETH.release(_to, actualAmount);

        if (relayerRefund > 0) {
            _assetPoolETH.release(_relayer, relayerRefund);
        }
        if (serviceFee > 0) {
            _assetPoolETH.release(payable(address(_feeManager)), serviceFee);
        }

        return (actualAmount, serviceFee, relayerRefund);
    }

    function _releaseFunds(
        FundReleaseDetails memory details
    ) internal returns (uint256, uint256, uint256) {
        if (
            details.assetAddress == ETH_ADDRESS ||
            details.assetAddress == address(0)
        ) {
            return
                _releaseETHWithFee(
                    details.recipient,
                    details.relayer,
                    details.relayerGasFee,
                    details.amount
                );
        } else {
            return
                _releaseERC20WithFee(
                    details.assetAddress,
                    details.recipient,
                    details.relayer,
                    details.relayerGasFee,
                    details.amount
                );
        }
    }

    function _buildNoteForERC20(
        address asset,
        uint256 amount,
        bytes32 noteFooter
    ) internal view returns (bytes32) {
        return
            _buildNote(
                asset,
                amount,
                noteFooter,
                IMimc254.NoteDomainSeparator.FUNGIBLE
            );
    }

    function _buildNoteForERC721(
        address asset,
        uint256 tokenId,
        bytes32 noteFooter
    ) internal view returns (bytes32) {
        return
            _buildNote(
                asset,
                tokenId,
                noteFooter,
                IMimc254.NoteDomainSeparator.NON_FUNGIBLE
            );
    }

    function _buildNote(
        address asset,
        uint256 amount,
        bytes32 noteFooter,
        IMimc254.NoteDomainSeparator domainSeparator
    ) private view returns (bytes32) {
        if (asset == address(0) || amount == 0 || noteFooter == bytes32(0)) {
            revert InvalidNoteParameters();
        }
        uint256[] memory array = new uint256[](4);
        array[0] = uint256(domainSeparator);
        array[1] = uint256(_bytifyToNoir(asset));
        array[2] = amount;
        array[3] = uint256(noteFooter);
        return bytes32(_mimc254.mimcBn254(array));
    }

    function _postDeposit(bytes32 note, bytes32 noteFooter) internal {
        _noteManager.registerNote(note);
        _noteManager.registerNoteFooter(noteFooter);
    }

    function _postWithdraw(bytes32 nullifier) internal {
        _noteManager.registerNullifier(nullifier);
    }

    function _validateRelayerIsRegistered(address relayer) internal view {
        if (!_relayerHub.isRelayerRegistered(relayer)) {
            revert RelayerNotRegistered();
        }
    }

    function _validateSenderIsRelayer(address relayer) internal view {
        if (msg.sender != relayer) {
            revert RelayerMismatch();
        }
    }

    function _validateNoteIsRegistered(bytes32 note) internal view {
        if (!_noteManager.checkNoteRegistered(note)) {
            revert NoteNotCreated();
        }
    }

    function _validateNoteIsNotRegistered(bytes32 note) internal view {
        if (_noteManager.checkNoteRegistered(note)) {
            revert NoteAlreadyCreated();
        }
    }

    function _validateNullifierIsNotRegistered(bytes32 nullifier) internal view {
        if (_noteManager.checkNullifierRegistered(nullifier)) {
            revert NullifierUsed();
        }
    }

    function _validateNullifierIsNotLocked(bytes32 nullifier) internal view {
        if (_noteManager.checkNullifierLocked(nullifier)) {
            revert NullifierLocked();
        }
    }

    function _validateNoteFooterIsNotRegistered(
        bytes32 noteFooter
    ) internal view {
        if (_noteManager.checkNoteFooterRegistered(noteFooter)) {
            revert NoteFooterUsed();
        }
    }
}
