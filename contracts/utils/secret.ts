import { Barretenberg, Fr } from "@aztec/bb.js";
import { Wallet } from "ethers";
import { Buffer32 } from "@aztec/bb.js/dest/node-cjs/types/fixed_size_buffer";

export type Point = {
  x: Fr;
  y: Fr;
};

export async function getSignature(
  message: Uint8Array,
  privateKey: Fr
): Promise<[Buffer32, Buffer32]> {
  const bb = await Barretenberg.new();
  return bb.schnorrConstructSignature(message, privateKey);
}

export async function getSecret(
  api: Barretenberg,
  signer: Wallet
): Promise<[Point, Fr]> {
  const sig = await getSignedMessage(signer);
  const field = Fr.fromBufferReduce(Buffer.from(sig.replace("0x", ""), "hex"));
  const pubkey = await api.schnorrComputePublicKey(field);

  return [pubkey, field];
}

export async function getSignedMessage(signer: Wallet): Promise<string> {
  return await signer.signMessage("hey ders!");
}

export async function getKeyPair(pk: string): Promise<[Point, Fr]> {
  const bb = await Barretenberg.new();
  const wallet = new Wallet(pk);

  return getSecret(bb, wallet);
}
