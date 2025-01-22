/// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IVkRegistry} from "./interfaces/IVkRegistry.sol";
import {IZkVerifyAttestation} from "./interfaces/IZkVerifyAttestation.sol";
import {IZKHub} from "./interfaces/IZKHub.sol";

contract ZKHub is IZKHub {
    IVkRegistry public vkRegistry;
    IZkVerifyAttestation public zkVerifier;

    // keccak256(abi.encodePacked("ultraplonk"))
    bytes32 public constant ULTRAPLONK_VERIFIER_CTX =
        0x0bd8ed885b9f366379eb800bf7cbf1748ac2b575c287be1a4e5d002d687208ea;

    constructor(IVkRegistry vkRegistry_, IZkVerifyAttestation zkVerifier_) {
        vkRegistry = vkRegistry_;
        zkVerifier = zkVerifier_;
    }

    function verifyProof(
        AttestationDetails memory attDetails,
        VerifyDetails memory verifyDetails
    ) external returns (bool) {
        bytes32 vkHash = vkRegistry.getVkHash(verifyDetails.verifierId);
        require(vkHash != bytes32(0), "ZKHub: Invalid verifier id");

        bytes32 leafDigest = _buildLeafDigest(
            vkHash,
            verifyDetails.publicInputs
        );

        return
            zkVerifier.verifyProofAttestation(
                attDetails.attestationId,
                leafDigest,
                attDetails.merklePath,
                attDetails.leafCount,
                attDetails.index
            );
    }

    function _buildLeafDigest(
        bytes32 vkHash,
        bytes32[] memory publicInputs
    ) internal pure returns (bytes32) {
        bytes32 pubs = keccak256(abi.encodePacked(publicInputs));
        return keccak256(abi.encode(ULTRAPLONK_VERIFIER_CTX, vkHash, pubs));
    }
}
