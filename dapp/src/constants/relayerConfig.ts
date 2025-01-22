import { ChainId, RelayerInfo } from '../types'

const SUPPORTED_CHAINS = process.env.NEXT_PUBLIC_SUPPORTED_CHAINS || (() => { throw new Error('NEXT_PUBLIC_SUPPORTED_CHAINS is not defined'); })()
const RELAYER_URLS = process.env.NEXT_PUBLIC_RELAYER_URLS || (() => { throw new Error('NEXT_PUBLIC_RELAYER_URLS is not defined'); })()

const processRelayers = (supportedChains: string, relayerUrls: string) => {
  const chains = supportedChains.split(',').map(Number)
  const urls = relayerUrls.split(',')
  

  const relayerMap: Record<number, string> = {};
  if (urls.length !== chains.length) {
  }
  chains.forEach((chain, index) => {
    relayerMap[chain] = urls[index]
  })

  return relayerMap
}

const relayerMap = processRelayers(SUPPORTED_CHAINS, RELAYER_URLS)

export const relayerConfig: { [chainId: number]: RelayerInfo[] } = {
  [ChainId.SEPOLIA]: [
    {
      relayerName: 'DP Relayer 1',
      relayerAddress: '0x0A20B38894799fD27837aF3Ed8929E7b8d1dDDe7',
      hostUrl: relayerMap[ChainId.SEPOLIA],
    },
  ],
  [ChainId.HARDHAT]: [
    {
      relayerName: 'DP Relayer 1',
      relayerAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      hostUrl: relayerMap[ChainId.HARDHAT],
    },
  ]
}