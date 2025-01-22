import axios from 'axios'
import {
    RelayerInfo
} from '../../types'

type RelayerSubmitProofRequest = {
    proof: string
    publicSignals: string[]
    vkHash: string
}

export async function submitProofToRelayer(
    proof: string,
    publicInputs: string[],
    statementHash: string,
    relayer: RelayerInfo
) {
    const request: RelayerSubmitProofRequest = {
        proof: proof,
        publicSignals: publicInputs,
        vkHash: statementHash,
    }
    console.log(request)
    const response = await axios.post(
        relayer.hostUrl + '/v1/pgZkVerifySubmitProof',
        request,
    )
    if (response.status == 200) {
        return response.data.id
    } else if (response.status == 400) {
        throw new Error('Request error' + response.data.error)
    } else {
        throw new Error('Relayer not asscessable')
    }
}
