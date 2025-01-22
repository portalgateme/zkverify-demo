import { zkVerifySession } from "zkverifyjs";
import { registerVerificationKey } from "../../services/zkVerify";
import { submitProof } from "../../services/zkVerify";
import { EthereumProvider } from "hardhat/types";
import { getLatestZkVerifyAttestationId } from "../../services/zkVerify";
import { IZKHub } from "../../typechain-types/contracts/core/interfaces/IZKHub";

export async function sendToZKV(
  session: zkVerifySession,
  vk: string,
  proof: Uint8Array,
  publicInputs: string[],
  provider: EthereumProvider
) {
  const statementHash = await registerVerificationKey(session, vk);

  console.log("Statement hash", statementHash);

  const proofHex = Buffer.from(proof).toString("hex");
  const result = await submitProof(
    session,
    proofHex,
    publicInputs,
    statementHash!
  );

  const attestationId = await getLatestZkVerifyAttestationId(provider);
  const merkleTreeRoot = result.attestationEvent?.attestation;

  const poe = await session.poe(
    result.attestationEvent?.id!,
    result.leafDigest!
  );

  const solidityAttestationDetails = {
    attestationId: BigInt(attestationId),
    merklePath: poe.proof,
    leafCount: poe.numberOfLeaves,
    index: poe.leafIndex,
  } as IZKHub.AttestationDetailsStruct;

  return {
    attestationId: BigInt(attestationId),
    merkleTreeRoot: merkleTreeRoot!,
    poe,
    solidityAttestationDetails,
  };
}
