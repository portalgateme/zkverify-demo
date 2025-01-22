import { Transport } from 'viem';
import { createConfig, http } from 'wagmi';
import { Chain, hardhat, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { chainsConfig, config } from "./constants/config";
import { ChainId } from './types';


const wagmiChainIdMapping: Record<number, Chain> = {
    [ChainId.SEPOLIA]: sepolia,
    [ChainId.HARDHAT]: hardhat,
}

const supportedWagmiChains = chainsConfig.supportedChains.map(
  (chainId) => wagmiChainIdMapping[chainId],
)

const rpcMapToTransport = (rpcMap: Record<number, string>) => {
  const transports: Record<number, Transport> = {}
  for (const chainId in rpcMap) {
    transports[chainId] = http(rpcMap[chainId])
  }
  return transports
}

export const wagmiConfig = createConfig({
    chains: [supportedWagmiChains[0],...supportedWagmiChains.slice(1)],
    connectors: [
        injected({ target: 'metaMask' })
    ],
    ssr: true,
    transports: rpcMapToTransport(chainsConfig.rpcUrls),
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
