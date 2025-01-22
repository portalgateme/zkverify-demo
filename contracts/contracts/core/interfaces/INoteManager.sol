// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @title INoteManager
/// @notice Interface for the NoteManager contract that manages registration and tracking of notes, nullifiers, and note footers
/// @dev Interface for zero-knowledge proof related components registry
interface INoteManager {
    /// @notice Emitted when a new note is registered
    /// @param note The hash of the registered note
    event NoteRegistered(bytes32 note);

    /// @notice Emitted when a new note footer is registered
    /// @param noteFooter The hash of the registered note footer
    event NoteFooterRegistered(bytes32 noteFooter);

    /// @notice Emitted when an asset manager is set
    /// @param manager The address of the asset manager
    /// @param allowed The authorization status of the asset manager
    event AssetManagerSet(address manager, bool allowed);

    /// @notice Registers a new note in the system
    /// @dev Can only be called by authorized asset managers
    /// @param note The hash of the note to register
    function registerNote(bytes32 note) external;

    /// @notice Registers a new note footer in the system
    /// @dev Can only be called by authorized asset managers
    /// @param noteFooter The hash of the note footer to register
    function registerNoteFooter(bytes32 noteFooter) external;

    /// @notice Checks if a note is registered
    /// @param note The hash of the note to check
    /// @return bool True if the note is registered, false otherwise
    function checkNoteRegistered(bytes32 note) external view returns (bool);


    /// @notice Checks if a note footer is registered
    /// @param noteFooter The hash of the note footer to check
    /// @return bool True if the note footer is registered, false otherwise
    function checkNoteFooterRegistered(
        bytes32 noteFooter
    ) external view returns (bool);

    /// @notice Returns whether an address is an authorized asset manager
    /// @param manager The address to check
    /// @return bool True if the address is an authorized asset manager, false otherwise
    function assetManagerAllowed(address manager) external view returns (bool);

    /// @notice Returns whether a note is registered
    /// @param note The hash of the note to check
    /// @return bool True if the note is registered, false otherwise
    function noteRegistered(bytes32 note) external view returns (bool);


    /// @notice Returns whether a note footer is registered
    /// @param noteFooter The hash of the note footer to check
    /// @return bool True if the note footer is registered, false otherwise
    function noteFooterRegistered(
        bytes32 noteFooter
    ) external view returns (bool);
}
