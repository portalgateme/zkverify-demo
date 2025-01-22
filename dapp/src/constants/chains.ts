import { ChainId } from '../types'

export type ChainConfig = {
  name: string
  icon: string
  chainId: number
}

export const supportedChains: { [chainId: number]: ChainConfig } = {
    [ChainId.SEPOLIA]: {
        name: 'Sepolia',
        icon: '/images/chain/ethereum.png',
        chainId: ChainId.SEPOLIA
    },
    [ChainId.HARDHAT]: {
        name: 'Hardhat',
        icon: '/images/chain/ethereum.png',
        chainId: ChainId.HARDHAT
    }
}
