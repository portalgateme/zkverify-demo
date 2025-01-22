// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {INoteManager} from "./interfaces/INoteManager.sol";

/// @title NoteManager
/// @notice Manages the registration and tracking of notes, nullifiers, and note footers
/// @dev This contract serves as a registry for zero-knowledge proof related components
contract NoteManager is Ownable, INoteManager {
    /// @notice Mapping to track registered notes
    /// @dev note hash => registration status
    mapping(bytes32 => bool) public noteRegistered;

    /// @notice Mapping to track registered note footers
    /// @dev note footer hash => registration status
    mapping(bytes32 => bool) public noteFooterRegistered;

    /// @notice Mapping to track authorized asset managers
    /// @dev manager address => authorization status
    mapping(address => bool) public assetManagerAllowed;

    /// @notice Restricts function access to authorized asset managers only
    /// @dev Throws if called by any account other than an authorized asset manager
    modifier onlyAssetManager() {
        require(
            assetManagerAllowed[msg.sender],
            "NoteManager: Only asset managers are allowed"
        );
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setAssetManager(address manager, bool allowed) external onlyOwner {
        assetManagerAllowed[manager] = allowed;
        emit AssetManagerSet(manager, allowed);
    }

    /// @notice Registers a new note in the system
    /// @dev Can only be called by authorized asset managers
    /// @param note The hash of the note to register
    function registerNote(bytes32 note) external onlyAssetManager {
        noteRegistered[note] = true;
        emit NoteRegistered(note);
    }


    /// @notice Registers a new note footer in the system
    /// @dev Can only be called by authorized asset managers
    /// @param noteFooter The hash of the note footer to register
    function registerNoteFooter(bytes32 noteFooter) external onlyAssetManager {
        noteFooterRegistered[noteFooter] = true;
        emit NoteFooterRegistered(noteFooter);
    }

    /// @notice Checks if a note is registered
    /// @param note The hash of the note to check
    /// @return bool True if the note is registered, false otherwise
    function checkNoteRegistered(bytes32 note) external view returns (bool) {
        return noteRegistered[note];
    }



    /// @notice Checks if a note footer is registered
    /// @param noteFooter The hash of the note footer to check
    /// @return bool True if the note footer is registered, false otherwise
    function checkNoteFooterRegistered(
        bytes32 noteFooter
    ) external view returns (bool) {
        return noteFooterRegistered[noteFooter];
    }
}
