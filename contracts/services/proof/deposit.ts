import { CompiledCircuit, Noir } from "@noir-lang/noir_js";
import { UltraPlonkBackend } from "@aztec/bb.js";
import { Note } from "../darkpool/note";

import depositCompiledCircuit from "../../circuits/deposit/target/deposit.json";

const noir = new Noir(depositCompiledCircuit as CompiledCircuit);
const generator = new UltraPlonkBackend(depositCompiledCircuit.bytecode);

export async function generateDepositProofParams(note: Note) {
  const { witness } = await noir.execute(note);
  const { proof, publicInputs } = await generator.generateProof(witness);

  return { proof, publicInputs };
}
