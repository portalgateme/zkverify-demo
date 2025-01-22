import { DarkpoolProofError, DepositProofParam, DepositProofResult, PROOF_DOMAIN } from "./types";
import { generateKeyPair, getNoteFooter } from './noteService';
import { bn_to_0xhex, bn_to_hex } from "../utils/formatters";
import { encodeAddress } from "../utils/encoders";
import { mergeUnit8Array } from "../utils/proofUtils";
import { mimc_bn254 } from "../utils";
import { generateProof, signMessage } from "./baseProofService";
import depositCircuit from "../circuits/deposit_compiled_circuit.json";

type DepositProofInput = {
    address: string,
    note: string,
    asset: string,
    amount: string,
    rho: string,
    note_footer: string,
    pub_key: [string, string],
    signature: any
}

export async function generateDepositProof(param: DepositProofParam): Promise<DepositProofResult> {
    if (param.note.amount <= BigInt(0)) {
        throw new DarkpoolProofError("amount should be greater than 0");
    }

    const [fuzkPubKey, fuzkPriKey] = await generateKeyPair(param.signedMessage);
    const noteFooter = getNoteFooter(param.note.rho, fuzkPubKey);

    const addressMod = encodeAddress(param.address);
    const message = bn_to_hex(mimc_bn254([
        BigInt(PROOF_DOMAIN.DEPOSIT),
        param.note.note,
        addressMod,
        noteFooter]));
    const signature = await signMessage(message, fuzkPriKey);

    const inputs: DepositProofInput = {
        rho: bn_to_0xhex(param.note.rho),
        note: bn_to_0xhex(param.note.note),
        amount: bn_to_0xhex(param.note.amount),
        asset: bn_to_0xhex(encodeAddress(param.note.asset)),
        address: bn_to_0xhex(addressMod),
        note_footer: bn_to_0xhex(noteFooter),
        pub_key: [fuzkPubKey.x.toString(), fuzkPubKey.y.toString()],
        signature: mergeUnit8Array(signature[0].buffer, signature[1].buffer),
    };
    const proof = await generateProof(depositCircuit, inputs);
    return {
        proof: proof,
        noteFooter: inputs.note_footer
    }
};