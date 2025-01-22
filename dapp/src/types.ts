import { Note } from './proof'

export class DarkpoolError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DarkpoolError'
    Object.setPrototypeOf(this, DarkpoolError.prototype)
  }
}

export type HexData = `0x${string}`

export type RelayerInfo = {
  relayerName: string
  relayerAddress: string
  hostUrl: string
}

export type Config = {
  chainId: number
  supportedChains: number[]
  rpcUrls: Record<number, string>
  oracleRpcUrls: Record<number, string>
}

export type ChainConfig = {
  chainId: number
  networkConfig: NetworkConfig
  rpcUrl: string
  oracleRpcUrl: string
  relayers: RelayerInfo[]
  tokens: TokenConfig[]
  topTokens: TokenConfig[]
  popularTokens: TokenConfig[]
}

export type NetworkConfig = {
  priceOracle: HexData
  ethAddress: HexData
  nativeWrapper: HexData
  complianceManager: HexData
  merkleTreeOperator: HexData
  darkpoolAssetManager: HexData

  explorerUrl: {
    tx: string
    address: string
    block: string
  }
}


export type TokenConfig = {
  name: string
  symbol: string
  decimals: number
  address: string
  logoURI?: string
  popular?: boolean
  isTop?: boolean
}


export enum NoteAction {
  DEPOSIT = 'DEPOSIT'
}



export enum ChainId {
  HARDHAT = 31337,
  SEPOLIA = 11155111
}


export type NoteWithToken = {
  note: Note
  token: TokenConfig
  secret?: string
}
