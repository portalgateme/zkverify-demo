/// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract VkRegistry {
    // Mapping of verifier id to verifier key hash
    mapping(uint256 verifierId => bytes32 verifierKeyHash) public vkHashes;

    event VerifierAdded(uint256 verifierId, bytes32 vkHash);

    function getVkHash(uint256 verifierId) external view returns (bytes32) {
        return vkHashes[verifierId];
    }

    function registerVkHash(string memory verifierName, bytes32 vkHash) external {
        uint256 verifierId = uint256(keccak256(abi.encode(verifierName)));
        _addVkHash(verifierId, vkHash);
    }

    function _addVkHash(uint256 verifierId, bytes32 vkHash) internal {
        vkHashes[verifierId] = vkHash;
        emit VerifierAdded(verifierId, vkHash);
    }
}
