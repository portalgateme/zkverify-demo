import { AbiCoder } from "@ethersproject/abi";
import { ripemd160 } from "@ethersproject/sha2";

const defaultAbiCoder = new AbiCoder();

export function encodeAddress(address: string): bigint {
    let encoder = defaultAbiCoder;
    let encodedAddress = encoder.encode(["address"], [address]);
    let hashedAddress = ripemd160(encodedAddress);
    return BigInt(hashedAddress);
}