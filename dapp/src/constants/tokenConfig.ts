import { ChainId, TokenConfig } from '../types'
import { hardhatTokens } from './tokens/hardhat'
import { sepoliaTokens } from './tokens/sepolia'

export const legacyTokenConfig: { [chainId: number]: string[] } = {
  [ChainId.SEPOLIA]: [],
  [ChainId.HARDHAT]: []
}


export const tokenConfig: { [chainId: string]: TokenConfig[] } = {
  [ChainId.SEPOLIA]: sepoliaTokens,
  [ChainId.HARDHAT]: hardhatTokens,
}