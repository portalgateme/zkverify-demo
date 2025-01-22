/// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IZKHub {
    struct AttestationDetails {
        uint256 attestationId;
        bytes32[] merklePath;
        uint256 leafCount;
        uint256 index;
    }

    struct VerifyDetails {
        uint256 verifierId;
        bytes32[] publicInputs;
    }

    function verifyProof(
        AttestationDetails memory attDetails,
        VerifyDetails memory verifyDetails
    ) external returns (bool);
}
