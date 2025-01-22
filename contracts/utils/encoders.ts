import { ethers, ripemd160 } from "ethers";

export function encodeAsset(address: string) {
  return ethers.getBigInt(encodeAddress(address));
}

export function encodeAddress(address: string) {
  const encoder = ethers.AbiCoder.defaultAbiCoder();
  let encodedAsset = encoder.encode(["address"], [address]);
  return ripemd160(encodedAsset);
}
