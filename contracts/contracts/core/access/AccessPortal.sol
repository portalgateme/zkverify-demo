// SPDX-License-Identifier: MIT

pragma solidity >=0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IComplianceManager.sol";
import "../interfaces/IAccessPortal.sol";

/// @title AccessPortal
/// @notice Manages the minting and validation of access tokens for users.
/// @dev Inherits from ERC721, ERC721Pausable, Ownable, and implements IComplianceManager and IAccessPortal.
contract AccessPortal is
    ERC721,
    ERC721Pausable,
    Ownable,
    IComplianceManager,
    IAccessPortal
{
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Constants
    bytes32 public constant MINT_DOMAIN_SEPARATOR = keccak256("mint"); /// @dev Domain separator used for minting
    bytes32 public constant EXTEND_DOMAIN_SEPARATOR = keccak256("extend"); /// @dev Domain separator used for extending expiration time
    bytes32 public constant BRIDGE_DOMAIN_SEPARATOR = keccak256("bridge"); /// @dev Domain separator used for minting bridged tokens

    // Public Variables
    uint256 public defaultExpirationPeriod = 365 days; /// @notice Default expiration time for tokens
    address public identityIssuer; /// @notice Address authorized to mint access tokens
    IComplianceManager[] public complianceManagers; /// @notice Address of the fallback compliance manager

    // Mappings
    mapping(address => uint256) public userToTokenId; /// @notice Maps user address to token ID
    mapping(uint256 => uint256) public tokenToExpiration; /// @notice Maps token ID to expiration time
    mapping(address => bool) public bannedUsers; /// @notice Maps user address to their banned status
    mapping(bytes32 => bool) public usedSignatures; /// @notice Tracks used signatures to prevent replay attacks

    // Private Variables
    uint256 private _tokenIdCounter; /// @dev Counter for tracking the next token ID

    /// @dev Modifier to ensure that the user is not banned
    /// @param user The address of the user to check
    modifier notBanned(address user) {
        if (bannedUsers[user]) {
            revert UserIsBanned();
        }
        _;
    }

    /// @notice Constructor for AccessPortal
    /// @param identityIssuer_ The address authorized to mint tokens
    /// @param initialOwner_ The address of the contract owner
    /// @param complianceManagers_ The array of address of the compliance manager
    constructor(
        address identityIssuer_,
        address initialOwner_,
        address[] memory complianceManagers_
    ) ERC721("Singularity Access Token", "SGAT") Ownable(initialOwner_) {
        _setIdentityIssuer(identityIssuer_);
        _setComplianceManagers(complianceManagers_);
    }

    // External Functions

    /// @notice Returns the compliance managers
    /// @return An array of compliance managers
    function getComplianceManagers()
        external
        view
        returns (IComplianceManager[] memory)
    {
        return complianceManagers;
    }

    /// @notice Returns the current block timestamp
    /// @return The current block timestamp
    function getCurrentBlockTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    /// @notice Returns the expiration time of the token for a given user
    /// @param user The address of the user
    /// @return The expiration timestamp of the user's token
    function getUserExpirationTime(
        address user
    ) external view returns (uint256) {
        return tokenToExpiration[userToTokenId[user]];
    }

    /// @notice Returns the ban status of a user
    /// @param user The address of the user
    /// @return True if the user is banned, false otherwise
    function getUserBanStatus(address user) external view returns (bool) {
        return bannedUsers[user];
    }

    /// @notice Sets the ban status of a user
    /// @param user The address of the user to update
    /// @param isBanned The new ban status (true for banned, false for not banned)
    function setUserBanStatus(address user, bool isBanned) external onlyOwner {
        bannedUsers[user] = isBanned;
        emit UserBanStatusUpdated(user, isBanned);
    }

    /// @notice Returns the address of the identity issuer
    /// @return The address of the current identity issuer
    function getIdentityIssuer() external view returns (address) {
        return identityIssuer;
    }

    /// @notice Pauses all token transfers
    /// @dev Can only be called by the contract owner
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses all token transfers
    /// @dev Can only be called by the contract owner
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Sets the identity issuer address
    /// @dev Can only be called by the contract owner
    /// @param identityIssuer_ The new address authorized to mint tokens
    function setIdentityIssuer(address identityIssuer_) external onlyOwner {
        _setIdentityIssuer(identityIssuer_);
    }

    /// @notice Sets the compliance manager address
    /// @dev Can only be called by the contract owner
    /// @dev Will reset the array and add the new compliance managers
    /// @param complianceManagers_ The new address of the compliance manager
    function setComplianceManagers(
        address[] memory complianceManagers_
    ) external onlyOwner {
        _setComplianceManagers(complianceManagers_);
    }

    /// @notice Adds a compliance manager
    /// @dev Can only be called by the contract owner
    /// @param complianceManager The address of the compliance manager to add
    function addComplianceManager(
        address complianceManager
    ) external onlyOwner {
        _addComplianceManager(complianceManager);
    }

    /// @notice Removes a compliance manager
    /// @dev Can only be called by the contract owner
    /// @param complianceManager The address of the compliance manager to remove
    function removeComplianceManager(
        address complianceManager
    ) external onlyOwner {
        _removeComplianceManager(complianceManager);
    }

    /// @notice Sets the default expiration period for tokens
    /// @dev Can only be called by the contract owner. Throws if the expiration period is 0.
    /// @param expirationPeriod The new default expiration period in seconds
    function setDefaultExpirationPeriod(
        uint256 expirationPeriod
    ) external onlyOwner {
        _setDefaultExpirationPeriod(expirationPeriod);
    }

    /// @notice Mints a new access token for a receiver with a specified expiration time
    /// @dev Validates the provided signature, ensures `expiresAt` is in the future, and mints the token
    /// @param receiver The address receiving the new access token
    /// @param expiresAt The timestamp at which the token will expire
    /// @param signatureExpiresAt The expiration time of the signature
    /// @param signature The signature of the token minting request
    function mint(
        address receiver,
        uint256 expiresAt,
        uint256 signatureExpiresAt,
        bytes memory signature
    ) external notBanned(receiver) returns (uint256) {
        if (signatureExpiresAt <= block.timestamp) {
            revert SignatureExpired();
        }

        uint256 chainId = block.chainid;
        uint256 tokenId = userToTokenId[receiver];

        if (tokenId != 0) {
            revert AccessTokenAlreadyMinted();
        }

        if (expiresAt <= block.timestamp) {
            revert InvalidExpirationTime();
        }

        bytes32 signatureHash = keccak256(
            abi.encodePacked(
                receiver,
                expiresAt,
                chainId,
                signatureExpiresAt,
                MINT_DOMAIN_SEPARATOR
            )
        );

        if (usedSignatures[signatureHash]) {
            revert SignatureIsUsed();
        }

        if (!_isSignatureValid(signatureHash, signature)) {
            revert InvalidSignature();
        }

        return _issueAccessToken(receiver, expiresAt);
    }

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
    ) external notBanned(receiver) returns (uint256) {
        if (signatureExpiresAt <= block.timestamp) {
            revert SignatureExpired();
        }

        uint256 chainId = block.chainid;

        if (bridgedFromChainId == chainId) {
            revert InvalidChainId();
        }

        uint256 tokenId = userToTokenId[receiver];
        if (tokenId != 0) {
            revert AccessTokenAlreadyMinted();
        }

        if (expiresAt <= block.timestamp) {
            revert InvalidExpirationTime();
        }

        bytes32 signatureHash = keccak256(
            abi.encodePacked(
                receiver,
                expiresAt,
                chainId,
                bridgedFromChainId,
                signatureExpiresAt,
                BRIDGE_DOMAIN_SEPARATOR
            )
        );

        if (usedSignatures[signatureHash]) {
            revert SignatureIsUsed();
        }

        if (!_isSignatureValid(signatureHash, signature)) {
            revert InvalidSignature();
        }

        return _issueAccessToken(receiver, expiresAt);
    }

    /// @notice Extends the expiration time of an existing access token
    /// @dev Requires a valid signature and a new expiration time greater than the current time
    /// @param receiver The address of the token holder
    /// @param newExpirationTime The new expiration time for the token
    /// @param signatureExpiresAt The expiration time of the signature
    /// @param signature The signature authorizing the extension
    function extend(
        address receiver,
        uint256 newExpirationTime,
        uint256 signatureExpiresAt,
        bytes memory signature
    ) external notBanned(receiver) {
        if (signatureExpiresAt <= block.timestamp) {
            revert SignatureExpired();
        }

        uint256 chainId = block.chainid;
        uint256 tokenId = userToTokenId[receiver];
        if (tokenId == 0) {
            revert AccessTokenDoesNotExist();
        }

        uint256 currentExpirationTime = tokenToExpiration[tokenId];
        if (
            newExpirationTime <= currentExpirationTime ||
            newExpirationTime <= block.timestamp
        ) {
            revert InvalidExpirationTime();
        }

        bytes32 signatureHash = keccak256(
            abi.encodePacked(
                receiver,
                newExpirationTime,
                chainId,
                signatureExpiresAt,
                EXTEND_DOMAIN_SEPARATOR
            )
        );

        if (usedSignatures[signatureHash]) {
            revert SignatureIsUsed();
        }

        bool signatureValid = _isSignatureValid(signatureHash, signature);

        if (!signatureValid) {
            revert InvalidSignature();
        }

        tokenToExpiration[tokenId] = newExpirationTime;

        emit AccessTokenExpirationTimeExtended(
            receiver,
            tokenId,
            newExpirationTime
        );
    }

    /// @notice Revokes an access token
    /// @dev Can only be called by the contract owner
    /// @param tokenId The ID of the token to be revoked
    function revoke(uint256 tokenId) external onlyOwner {
        address owner = _ownerOf(tokenId);
        _burn(tokenId);
        delete userToTokenId[owner];
        delete tokenToExpiration[tokenId];

        emit AccessTokenRevoked(owner, tokenId);
    }

    // Public Functions
    /// @notice Checks if the token with the given ID has not expired
    /// @param tokenId The ID of the token to check
    /// @return bool Returns true if the token is not expired, otherwise false
    function isTokenNotExpired(uint256 tokenId) public view returns (bool) {
        return tokenToExpiration[tokenId] > block.timestamp;
    }

    /// @notice Checks if the token for a given user has not expired
    /// @param user The address of the user to check
    /// @return bool Returns true if the token is not expired, otherwise false
    function isUserTokenNotExpired(address user) external view returns (bool) {
        return isTokenNotExpired(userToTokenId[user]);
    }

    /// @notice Checks if a subject is authorized based on their token's expiration status or the fallback compliance manager
    /// @dev This function overrides the `isAuthorized` function from the `IComplianceManager` interface
    /// @param subject The address being checked for authorization
    /// @return bool Returns true if the subject's token is not expired or the fallback compliance manager, otherwise false
    function isAuthorized(
        address /* observer */,
        address subject
    ) external override returns (bool) {
        uint256 tokenId = userToTokenId[subject];
        return
            isTokenNotExpired(tokenId) ||
            isAuthorizedOnFallbackComplianceManager(subject);
    }

    /// @notice Checks if a user is authorized based on the fallback compliance manager
    /// @param user The address of the user to check
    /// @return True if the user is authorized, false otherwise
    function isAuthorizedOnFallbackComplianceManager(
        address user
    ) public returns (bool) {
        for (uint256 i = 0; i < complianceManagers.length; i++) {
            address manager = address(complianceManagers[i]);
            try
                IComplianceManager(manager).isAuthorized(address(this), user)
            returns (bool authorized) {
                if (authorized) {
                    return true;
                }
            } catch {
                continue;
            }
        }
        return false;
    }

    // Internal Functions
    /// @notice Internal function to validate the minting signature
    /// @param data The data used to create the hash for signature verification (e.g., receiver and expiration time)
    /// @param signature The signature of the token minting request
    /// @return bool Returns true if the signature is valid, otherwise false
    function _isSignatureValid(
        bytes32 data,
        bytes memory signature
    ) internal view returns (bool) {
        bytes32 messageHash = data.toEthSignedMessageHash();
        address signer = messageHash.recover(signature);

        return signer == identityIssuer;
    }

    /// @notice Internal function to issue a new access token
    /// @param receiver The address receiving the new access token
    /// @param expiresAt The timestamp at which the token will expire
    /// @return uint256 The ID of the newly minted token
    function _issueAccessToken(
        address receiver,
        uint256 expiresAt
    ) internal returns (uint256) {
        _tokenIdCounter += 1;
        tokenToExpiration[_tokenIdCounter] = expiresAt;
        userToTokenId[receiver] = _tokenIdCounter;

        _safeMint(receiver, _tokenIdCounter);

        emit AccessTokenIssued(receiver, _tokenIdCounter, expiresAt);

        return _tokenIdCounter;
    }

    /// @notice Updates the token's owner information
    /// @dev This function overrides the `_update` function from ERC721 and ERC721Pausable. Tokens are non-transferable.
    /// @param to The address to transfer the token to
    /// @param tokenId The ID of the token being transferred
    /// @param auth The authorization address
    /// @return address The address of the previous owner
    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(ERC721, ERC721Pausable)
        whenNotPaused
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert AccessTokenNotTransferable();
        }

        return super._update(to, tokenId, auth);
    }

    /// @notice Internal function to set the identity issuer address
    /// @param identityIssuer_ The new address authorized to mint tokens
    function _setIdentityIssuer(address identityIssuer_) internal {
        identityIssuer = identityIssuer_;
        emit IdentityIssuerSet(identityIssuer_);
    }

    /// @notice Internal function to set the compliance manager address
    /// @param complianceManagers_ The new address of the compliance manager
    function _setComplianceManagers(
        address[] memory complianceManagers_
    ) internal {
        delete complianceManagers;

        for (uint256 i = 0; i < complianceManagers_.length; i++) {
            _addComplianceManager(complianceManagers_[i]);
        }
    }

    /// @notice Internal function to add a compliance manager
    /// @param complianceManager The address of the compliance manager to add
    function _addComplianceManager(address complianceManager) internal {
        complianceManagers.push(IComplianceManager(complianceManager));
        emit ComplianceManagerSet(complianceManager);
    }

    /// @notice Internal function to remove a compliance manager
    /// @param complianceManager The address of the compliance manager to remove
    function _removeComplianceManager(address complianceManager) internal {
        for (uint256 i = 0; i < complianceManagers.length; i++) {
            if (address(complianceManagers[i]) == complianceManager) {
                complianceManagers[i] = complianceManagers[
                    complianceManagers.length - 1
                ];
                complianceManagers.pop();
                emit ComplianceManagerRemoved(complianceManager);
                return;
            }
        }
    }

    /// @notice Internal function to set the default expiration period for tokens
    /// @param expirationPeriod The new default expiration period in seconds
    function _setDefaultExpirationPeriod(uint256 expirationPeriod) internal {
        if (expirationPeriod == 0) {
            revert InvalidExpirationTime();
        }

        defaultExpirationPeriod = expirationPeriod;
        emit DefaultExpirationPeriodSet(expirationPeriod);
    }
}
