import { Barretenberg, UltraPlonkBackend } from "@aztec/bb.js";
import { hexlify } from "@ethersproject/bytes";
import { CompiledCircuit, Noir } from "@noir-lang/noir_js";
import { Buffer } from "buffer";

export async function generateProof(
    circuit: any,
    inputs: any
) {
    const start_time = new Date().getTime();
    const backend = new UltraPlonkBackend(circuit.bytecode, {
        threads: navigator.hardwareConcurrency,
    });
    const noir = new Noir(circuit as CompiledCircuit);
    const { witness } = await noir.execute(inputs);
    const { proof, publicInputs } = await backend.generateProof(witness);

    console.log("" + (new Date().getTime() - start_time) + "ms");
    return { proof: hexlify(proof), verifyInputs: publicInputs };
}


export async function signMessage(message: string, fuzkPriKey: any) {
    const api = await Barretenberg.new();
    return await api.schnorrConstructSignature(Buffer.from(message, "hex").reverse(), fuzkPriKey);
}