/// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IVkRegistry {
    function getVkHash(uint256 verifierId) external view returns (bytes32);

    function registerVkHash(
        string memory verifierName,
        bytes32 vkHash
    ) external;
}
