import { ethers, parseEther } from "ethers";
import { EthereumProvider, HardhatRuntimeEnvironment } from "hardhat/types";
import { ZK_VERIFY_ATTESTATION_ADDRESS } from "./consts";
import { ATTESTATION_ABI, INITIAL_BALANCE } from "./consts";
import { ATTESTATION_RELAYER_ADDRESS } from "./consts";

export async function seedZkVerifyTransaction(
  hre: HardhatRuntimeEnvironment,
  attestationId: bigint,
  merkleRoot: string
): Promise<ethers.TransactionResponse> {
  const { provider } = hre.network;

  await provider.send("hardhat_impersonateAccount", [
    ATTESTATION_RELAYER_ADDRESS,
  ]);

  const signer = await hre.ethers.getImpersonatedSigner(
    ATTESTATION_RELAYER_ADDRESS
  );

  await provider.send("hardhat_setBalance", [
    ATTESTATION_RELAYER_ADDRESS,
    "0x" + parseEther(INITIAL_BALANCE).toString(16),
  ]);

  const attestationContract = new ethers.Contract(
    ZK_VERIFY_ATTESTATION_ADDRESS,
    ATTESTATION_ABI,
    signer
  );

  const tx = await attestationContract.submitAttestation(
    attestationId,
    merkleRoot
  );

  await tx.wait();

  return tx;
}
