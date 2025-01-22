// SPDX-License-Identifier: MIT

pragma solidity >=0.8.20;

import "./IComplianceManager.sol";

/// @title IAccessPortal
/// @notice Interface for AccessPortal contract which handles access token management.
interface IAccessPortal {
    // Events
    /// @notice Emitted when a new access token is issued.
    /// @param receiver The address that received the newly minted access token.
    /// @param tokenId The ID of the newly minted token.
    /// @param expirationTime The timestamp at which the token will expire.
    event AccessTokenIssued(
        address indexed receiver,
        uint256 tokenId,
        uint256 expirationTime
    );

    /// @notice Emitted when an access token is revoked.
    /// @param receiver The address whose token was revoked.
    /// @param tokenId The ID of the revoked token.
    event AccessTokenRevoked(address indexed receiver, uint256 tokenId);

    /// @notice Emitted when an access token's expiration time is extended.
    /// @param receiver The address that holds the access token.
    /// @param tokenId The ID of the token whose expiration was extended.
    /// @param newExpirationTime The new expiration time for the token.
    event AccessTokenExpirationTimeExtended(
        address indexed receiver,
        uint256 tokenId,
        uint256 newExpirationTime
    );

    /// @notice Emitted when the identity issuer is set or updated.
    /// @param identityIssuer The address authorized to mint access tokens.
    event IdentityIssuerSet(address indexed identityIssuer);

    /// @notice Emitted when the compliance manager is set or updated.
    /// @param complianceManager The address of the compliance manager.
    event ComplianceManagerSet(address indexed complianceManager);

    /// @notice Emitted when the compliance manager is removed.
    /// @param complianceManager The address of the compliance manager.
    event ComplianceManagerRemoved(address indexed complianceManager);

    /// @notice Emitted when the default expiration period for tokens is updated.
    /// @param expirationPeriod The new default expiration period for tokens (in seconds).
    event DefaultExpirationPeriodSet(uint256 expirationPeriod);

    /// @notice Emitted when a user's ban status is updated.
    /// @param user The address of the user whose ban status was updated.
    /// @param banned True if the user is banned, false otherwise.
    event UserBanStatusUpdated(address indexed user, bool banned);

    // Errors
    /// @notice Thrown when a user is banned from accessing the system.
    error UserIsBanned();

    /// @notice Thrown when an invalid signature is provided during token minting or extension.
    error InvalidSignature();

    /// @notice Thrown when the provided expiration time is not in the future.
    error InvalidExpirationTime();

    /// @notice Thrown when an attempt is made to transfer a non-transferable token.
    error AccessTokenNotTransferable();

    /// @notice Thrown when a provided signature has already been used.
    error SignatureIsUsed();

    /// @notice Thrown when a provided signature has expired.
    error SignatureExpired();

    /// @notice Thrown when an access token does not exist.
    error AccessTokenDoesNotExist();

    /// @notice Thrown when a user already has an access token minted.
    error AccessTokenAlreadyMinted();

    /// @notice Thrown when invalid chainId is provided.
    error InvalidChainId();

    // External Functions

    /// @notice Returns the compliance managers
    /// @return An array of compliance managers
    function getComplianceManagers()
        external
        view
        returns (IComplianceManager[] memory);

    /// @notice Mints a new access token for the receiver with a specified expiration time.
    /// @dev Validates the provided signature and ensures the expiration time is in the future.
    /// @param receiver The address receiving the new access token.
    /// @param expiresAt The timestamp (in seconds) at which the token will expire. If 0, default expiration is used.
    /// @param signatureExpiresAt The expiration time of the signature
    /// @param signature The signature of the token minting request.
    function mint(
        address receiver,
        uint256 expiresAt,
        uint256 signatureExpiresAt,
        bytes memory signature
    ) external returns (uint256);

    /// @notice Mints a new access token that is bridged from other chain for a receiver with a specified expiration time
    /// @dev Validates the provided signature, ensures `expiresAt` is in the future, and mints the token
    /// @param receiver The address receiving the new access token
    /// @param expiresAt The timestamp at which the token will expire
    /// @param bridgedFromChainId The ID of the chain from which the token is bridged
    /// @param signatureExpiresAt The expiration time of the signature
    /// @param signature The signature of the token minting request
    function mintBridged(
        address receiver,
        uint256 expiresAt,
        uint256 bridgedFromChainId,
        uint256 signatureExpiresAt,
        bytes memory signature
    ) external returns (uint256);

    /// @notice Extends the expiration time of an existing access token.
    /// @dev Validates the provided signature and ensures the new expiration time is greater than the current one.
    /// @param receiver The address of the token holder.
    /// @param newExpirationTime The new expiration time for the token.
    /// @param signatureExpiresAt The expiration time of the signature
    /// @param signature The signature of the token expiration extension request.
    function extend(
        address receiver,
        uint256 newExpirationTime,
        uint256 signatureExpiresAt,
        bytes memory signature
    ) external;

    /// @notice Revokes an access token.
    /// @dev Can only be called by the contract owner.
    /// @param tokenId The ID of the token to be revoked.
    function revoke(uint256 tokenId) external;

    /// @notice Sets the ban status of a user.
    /// @dev Can only be called by the contract owner.
    /// @param user The address of the user to update.
    /// @param isBanned True if the user is banned, false otherwise.
    function setUserBanStatus(address user, bool isBanned) external;

    /// @notice Pauses all token transfers.
    /// @dev Can only be called by the contract owner.
    function pause() external;

    /// @notice Unpauses all token transfers.
    /// @dev Can only be called by the contract owner.
    function unpause() external;

    /// @notice Sets the identity issuer address.
    /// @dev Can only be called by the contract owner.
    /// @param identityIssuer_ The new address authorized to mint tokens.
    function setIdentityIssuer(address identityIssuer_) external;

    /// @notice Sets the compliance manager address
    /// @dev Can only be called by the contract owner
    /// @dev Will reset the array and add the new compliance managers
    /// @param complianceManagers_ The new address of the compliance manager
    function setComplianceManagers(
        address[] memory complianceManagers_
    ) external;

    /// @notice Adds a compliance manager
    /// @dev Can only be called by the contract owner
    /// @param complianceManager The address of the compliance manager to add
    function addComplianceManager(address complianceManager) external;

    /// @notice Removes a compliance manager
    /// @dev Can only be called by the contract owner
    /// @param complianceManager The address of the compliance manager to remove
    function removeComplianceManager(address complianceManager) external;

    /// @notice Sets the default expiration period for tokens.
    /// @dev Can only be called by the contract owner. Throws if the expiration period is 0.
    /// @param expirationPeriod The new default expiration period in seconds.
    function setDefaultExpirationPeriod(uint256 expirationPeriod) external;

    // View Functions
    /// @notice Returns the expiration time of the token for a given user.
    /// @param user The address of the user.
    /// @return The expiration timestamp of the user's token.
    function getUserExpirationTime(
        address user
    ) external view returns (uint256);

    /// @notice Returns the ban status of a user.
    /// @param user The address of the user.
    /// @return True if the user is banned, false otherwise.
    function getUserBanStatus(address user) external view returns (bool);

    /// @notice Returns the address of the identity issuer.
    /// @return The address of the current identity issuer.
    function getIdentityIssuer() external view returns (address);

    /// @notice Checks if the token with the given ID has not expired.
    /// @param tokenId The ID of the token to check expiration.
    /// @return bool Returns true if the token is not expired, otherwise false.
    function isTokenNotExpired(uint256 tokenId) external view returns (bool);

    /// @notice Checks if the token for a given user has not expired
    /// @param user The address of the user to check
    /// @return bool Returns true if the token is not expired, otherwise false
    function isUserTokenNotExpired(address user) external view returns (bool);

    /// @notice Checks if a user is authorized based on the fallback compliance manager.
    /// @param user The address of the user to check.
    /// @return True if the user is authorized, false otherwise.
    function isAuthorizedOnFallbackComplianceManager(
        address user
    ) external returns (bool);
}
