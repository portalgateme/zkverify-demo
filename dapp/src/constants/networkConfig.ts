import { NetworkConfig, ChainId } from '../types'

export const networkConfig: { [chainId: number]: NetworkConfig } = {
  [ChainId.SEPOLIA]: {
    priceOracle: '0x4Fe44a9aC8Ef059Be2dB97f9e3bcA32Ab698C2f2',
    ethAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    nativeWrapper: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',

    complianceManager: '0x27bf7628D1827FE361D5aFCD31bC507D23281C45',
    merkleTreeOperator: '0x20e904bb245A4ac8cBBa43B6EbdB0C7C709Fb24f',
    darkpoolAssetManager: '0xB6E72619e33a22e263f0C6B566e6C0D91c56d45a',
    explorerUrl: {
      tx: 'https://sepolia.etherscan.io/tx/',
      address: 'https://sepolia.etherscan.io/address/',
      block: 'https://sepolia.etherscan.io/block/',
    },
  },
  [ChainId.HARDHAT]: {
    priceOracle: '0x0AdDd25a91563696D8567Df78D5A01C9a991F9B8',
    ethAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    nativeWrapper: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    merkleTreeOperator: '0x51BC89AA19505Fe8e6415d2680e2D1c2806AB981',
    complianceManager: '0x599E43e3DaE7E974E3373eBB1804a3eE2F5ebE53',
    darkpoolAssetManager: '0x8951F74b7dbFBdBB8606856a36766A47d71B4814',
    explorerUrl: {
      tx: 'https://sepolia.etherscan.io/tx/',
      address: 'https://sepolia.etherscan.io/address/',
      block: 'https://sepolia.etherscan.io/block/',
    },
  }
}
