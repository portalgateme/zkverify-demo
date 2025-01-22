require("dotenv").config();
import { ethers } from "ethers";
import { EthereumProvider } from "hardhat/types";
import { zkVerifySession } from "zkverifyjs";
import { ZK_VERIFY_ATTESTATION_ADDRESS } from "../test/utils/consts";
import { LATEST_ATTESTATION_ABI } from "../test/utils/consts";

export function getWalletSeed(): string {
  return process.env.WALLET_SEED!;
}

export async function initSession() {
  const seed = getWalletSeed();
  console.log(`Seed: ${seed}`);

  const session = await zkVerifySession.start().Testnet().withAccount(seed);
  return session;
}

export async function registerVerificationKey(
  session: zkVerifySession,
  vk: string
) {
  const { transactionResult: registerVKTransactionDetails } = await session
    .registerVerificationKey()
    .ultraplonk()
    .execute(vk);

  const { statementHash } = await registerVKTransactionDetails;

  return statementHash;
}

export async function submitProof(
  session: zkVerifySession,
  proof: string,
  publicInputs: string[],
  statementHash: string
) {
  const { transactionResult: submitProofTransactionDetails } = await session
    .verify()
    .ultraplonk()
    .withRegisteredVk()
    .waitForPublishedAttestation()
    .execute({
      proofData: {
        proof,
        publicSignals: publicInputs,
        vk: statementHash,
      },
    });

  const res = await submitProofTransactionDetails;

  return res;
}

export async function getLatestZkVerifyAttestationId(
  provider: EthereumProvider
): Promise<string> {
  const latestAttestationInterface = new ethers.Interface(
    LATEST_ATTESTATION_ABI
  );
  const encodedData = latestAttestationInterface.encodeFunctionData(
    "latestAttestationId"
  );

  const result = await provider.request({
    method: "eth_call",
    params: [
      {
        to: ZK_VERIFY_ATTESTATION_ADDRESS,
        data: encodedData,
      },
      "latest",
    ],
  });

  return result as string;
}
