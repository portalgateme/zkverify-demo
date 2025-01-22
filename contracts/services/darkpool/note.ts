import { Barretenberg } from "@aztec/bb.js";
import { ethers } from "ethers";
import crypto from "crypto";

import {} from "@noir-lang/noir_js";

import { getSignature, Point } from "../../utils/secret";
import { mimc_bn254, P } from "../../utils/crypto";
import { to0xHex, toHex } from "../../utils/formatters";
import { getSecret } from "../../utils/secret";
import { encodeAddress, encodeAsset } from "../../utils/encoders";

export type CreateNoteArgs = {
  pk: string;
  amount: string;
  asset: string;
};

export type Note = {
  note: string;
  address: string;
  amount: string;
  rho: string;
  pub_key: [string, string];
  note_footer: string;
  signature: number[];
  asset: string;
  nullifier: string;
  footer: string;
};

export const generateNoteFooter = (rho: bigint, fuzkPubkey: Point): bigint => {
  const hRho = mimc_bn254([rho]);
  return mimc_bn254([
    hRho,
    BigInt(fuzkPubkey.x.toString()),
    BigInt(fuzkPubkey.y.toString()),
  ]);
};

export const generateRho = (): bigint => {
  let ab = new ArrayBuffer(32);
  return crypto.getRandomValues(Buffer.from(ab)).readBigUInt64BE() % P;
};

export const buildNullifier = async (
  rho: bigint,
  pk: string
): Promise<bigint> => {
  const bb = await Barretenberg.new();
  const wallet = new ethers.Wallet(pk);

  const [fuzkPubkey] = await getSecret(bb, wallet);

  return mimc_bn254([
    rho,
    BigInt(fuzkPubkey.x.toString()),
    BigInt(fuzkPubkey.y.toString()),
  ]);
};

export const createNote = async (args: CreateNoteArgs): Promise<Note> => {
  const { pk, amount, asset } = args;

  const bb = await Barretenberg.new();
  const wallet = new ethers.Wallet(pk);
  const addressHash = encodeAddress(wallet.address);
  const addressBigInt = ethers.getBigInt(addressHash);

  const [fuzkPubkey, fuzkPrivKey] = await getSecret(bb, wallet);

  const rho = generateRho();

  const assetMod = encodeAsset(asset);
  const noteFooter = generateNoteFooter(rho, fuzkPubkey);

  const note = mimc_bn254([0n, assetMod, BigInt(amount), noteFooter]);
  const message = toHex(mimc_bn254([1n, note, addressBigInt, noteFooter]));
  const nullifier = mimc_bn254([
    rho,
    BigInt(fuzkPubkey.x.toString()),
    BigInt(fuzkPubkey.y.toString()),
  ]);

  const sig = await getSignature(
    Buffer.from(message, "hex").reverse(),
    fuzkPrivKey
  );

  return {
    address: to0xHex(addressBigInt),
    note: to0xHex(note),
    asset: to0xHex(assetMod),
    amount: to0xHex(BigInt(amount)),
    rho: to0xHex(rho),
    note_footer: to0xHex(noteFooter),
    pub_key: [fuzkPubkey.x.toString(), fuzkPubkey.y.toString()] as [
      string,
      string
    ],
    nullifier: to0xHex(nullifier),
    footer: to0xHex(noteFooter),
    signature: [...sig[0].buffer, ...sig[1].buffer],
  };
};
