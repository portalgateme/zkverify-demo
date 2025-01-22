import { TokenConfig } from '../types'
import invariant from 'tiny-invariant'
import { ethers } from 'ethers'
import { networkConfig } from '../constants/networkConfig'

export const ZERO_BYTES32 = hexlify32(0)

export function isAddressEquals(address1: string, address2: string) {
  return ethers.utils.getAddress(address1) === ethers.utils.getAddress(address2)
}

export function isNotNativeCurrencyByChain(asset: string, chainId: number) {
  return asset.toLowerCase() != networkConfig[chainId].ethAddress.toLowerCase()
}

export function isNativeCurrencyByChain(asset: string, chainId: number) {
  return isAddressEquals(asset, networkConfig[chainId].ethAddress)
}

export function isNativeWrappedCurrencyByChain(asset: string, chainId: number) {
  return isAddressEquals(asset, networkConfig[chainId].nativeWrapper)
}

export function tokenSortsBefore(tokenA: TokenConfig, tokenB: TokenConfig) {
  invariant(
    tokenA.address.toLowerCase() !== tokenB.address.toLowerCase(),
    'ADDRESSES',
  )
  return tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
}

export function hexlify32(num: bigint | number) {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(num), 32)
}

export function hexlify16(num: bigint | number) {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(num), 16)
}

export function hexlify8(num: bigint | number) {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(num), 8)
}

export function hexlify5(num: bigint | number) {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(num), 5)
}

export function hexEquals(hex1: string, hex2: string) {
  if (!hex1 || !hex2) {
    return false
  }

  return hex1.toLowerCase() === hex2.toLowerCase()
}

export function hexInArray(hex: string, array: string[]) {
  return array.some((item) => hexEquals(item, hex))
}
