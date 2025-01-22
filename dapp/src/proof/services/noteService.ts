import { Barretenberg, Fr } from "@aztec/bb.js";
import { BigNumber } from "@ethersproject/bignumber";
import { Buffer } from "buffer";
import { P } from "../utils/constants";
import { encodeAddress } from "../utils/encoders";
import { mimc_bn254 } from "../utils/mimc";
import { Note, NoteWithFooter } from "./types";

export const DOMAIN_NOTE = 0n;

export async function createNote(
    asset: string,
    amount: bigint,
    signedMessage: string,
): Promise<Note> {
    const noteExt = await createNoteWithFooter(amount, asset, signedMessage);
    return {
        rho: noteExt.rho,
        note: noteExt.note,
        amount: noteExt.amount,
        asset: noteExt.asset,
    }
}

export async function createNoteWithFooter(
    amount: bigint,
    asset: string,
    signedMessage: string,
): Promise<NoteWithFooter> {
    const rho = generateRho();
    return createNoteWithRho(rho, asset, amount, signedMessage, DOMAIN_NOTE);
}

async function createNoteWithRho(
    rho: bigint,
    asset: string,
    amount: bigint,
    signedMessage: string,
    domain: bigint) {
    const [fuzkPubKey] = await generateKeyPair(signedMessage);

    return createNoteWithPubKey(rho, asset, amount, fuzkPubKey, domain);
}

export async function createNoteWithPubKey(
    rho: bigint,
    asset: string,
    amount: bigint,
    fuzkPubKey: any,
    domain: bigint) {
    const footer = getNoteFooter(rho, fuzkPubKey)

    const assetMod = encodeAddress(asset);
    const note = buildNoteCommitment(
        domain,
        assetMod,
        amount,
        footer
    );
    return {
        rho,
        note,
        asset,
        amount,
        footer
    };
}

function buildNoteCommitment(domain: bigint, asset: bigint, amount: bigint, footer: bigint) {
    return mimc_bn254([
        domain,
        asset,
        amount,
        footer
    ]);
}

export function getNoteFooter(rho: bigint, publicKey: any): bigint {
    return mimc_bn254([mimc_bn254([BigInt(rho)]), BigInt(publicKey.x.toString()), BigInt(publicKey.y.toString())]);
}

export function generateRho(): bigint {
    const securityLevel = 128;
    const primeByteLength = Math.ceil(P.toString(2).length / 8);
    const totalBytes = primeByteLength + Math.ceil(securityLevel / 8);

    let rho;
    do {
        let ab = new ArrayBuffer(totalBytes);
        let buf = new Uint8Array(ab);
        rho = BigNumber.from(crypto.getRandomValues(buf)).toBigInt() % P;
    } while (rho === BigInt(0));

    return rho;
}

export async function generateKeyPair(signature: string): Promise<[any, any]> {
    const bb = await Barretenberg.new();
    const privateKey = Fr.fromBufferReduce(Buffer.from(signature.replace("0x", ""), "hex"));
    const publicKey = await bb.schnorrComputePublicKey(privateKey);
    return [publicKey, privateKey];
}