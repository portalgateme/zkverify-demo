import { ethers } from 'ethers'
import { StaticImageData } from 'next/image'
import { chainsConfig } from '../constants/config'

export interface IToken {
    name: string
    symbol: string
    address: string
    decimals: number
    image: StaticImageData
    tokenId: string
}

const getProviderMap = () => {
    const providerMap: Record<number, ethers.providers.JsonRpcProvider> = {}
    for (const chainId in chainsConfig.rpcUrls) {
        providerMap[chainId] = new ethers.providers.JsonRpcProvider(chainsConfig.rpcUrls[chainId])
    }

    return providerMap
}


const providerMap = getProviderMap();

export const getProviderByChainId = (chainId: number) => {
    return providerMap[chainId]
}