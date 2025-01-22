import axios from "axios";
import { DarkpoolError, RelayerInfo } from "../types";
import { relayerConfig } from "../constants/relayerConfig";


export type AttestationDetails = {
    attestationId: bigint;
    merklePath: string[];
    leafCount: bigint;
    index: bigint;
  }

export function getRelayer(chainId: number): RelayerInfo {
    const relayers = relayerConfig[chainId]
    if (relayers.length === 0) {
        throw new DarkpoolError('Relayer is not initialized');
    }
    const index = Math.floor(Math.random() * relayers.length);
    return relayers[index];
}



export const pollJobData = async (id: string, relayerUrl: string): Promise<{ error: string | undefined, txHash: string | undefined, result: AttestationDetails | undefined }> => {
    let tries = 1
    while (tries <= 100) {
        if (tries >= 100) {
            break;
        }
        try {
            const response = await axios.get(`${relayerUrl}/v1/jobs/${id}`)
            if (response.status === 400) {
                const { error } = response.data
                console.log(error)
                return {
                    error: 'Failed to submit transaction to relayer:' + error,
                    txHash: undefined,
                    result: undefined,
                }
            }
            if (response.status === 200) {
                const { txHash, confirmations, status, failedReason, result } =
                    response.data
                console.log(response.data)

                if (status === 'FAILED') {
                    return {
                        error: failedReason ?? 'Transaction failed.',
                        txHash: txHash,
                        result: undefined,
                    }
                }
                if (status === 'CONFIRMED' || status === 'MINED') {
                    return {
                        error: undefined,
                        txHash: txHash,
                        result: {
                            attestationId: BigInt(result.attestationId),
                            merklePath: result.merklePath,
                            leafCount: BigInt(result.leafCount),
                            index: BigInt(result.index),
                        },
                    }
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 5000))
        } catch (error: any) {
            console.log(error)
        }
        tries++
    }

    return {
        error: "Waited too long for transaction to be mined.",
        txHash: undefined,
        result: undefined,
    }
}

export const pollJobStatus = async (id: string, relayerUrl: string): Promise<{ error: string | undefined, txHash: string | undefined }> => {
    let tries = 1
    while (tries <= 100) {
        if (tries >= 100) {
            break;
        }
        try {
            const response = await axios.get(`${relayerUrl}/v1/jobs/${id}`)
            if (response.status === 400) {
                const { error } = response.data
                console.log(error)
                return {
                    error: 'Failed to submit transaction to relayer:' + error,
                    txHash: undefined,
                }
            }
            if (response.status === 200) {
                const { txHash, confirmations, status, failedReason } =
                    response.data
                console.log(response.data)

                if (status === 'FAILED') {
                    return {
                        error: failedReason ?? 'Transaction failed.',
                        txHash: txHash,
                    }
                }
                if (status === 'CONFIRMED' || status === 'MINED') {
                    return {
                        error: undefined,
                        txHash: txHash,
                    }
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 5000))
        } catch (error: any) {
            console.log(error)
        }
        tries++
    }

    return {
        error: "Waited too long for transaction to be mined.",
        txHash: undefined,
    }
}