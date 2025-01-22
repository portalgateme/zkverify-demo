import { isEmpty } from 'lodash'
import { ChainConfig, Config } from '../types'
import { networkConfig } from './networkConfig'
import { relayerConfig } from './relayerConfig'
import { tokenConfig } from './tokenConfig'

const CHAIN_ID =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID) ||
  (() => {
    throw new Error('NEXT_PUBLIC_CHAIN_ID is not defined')
  })()
const SUPPORTED_CHAINS =
  process.env.NEXT_PUBLIC_SUPPORTED_CHAINS ||
  (() => {
    throw new Error('NEXT_PUBLIC_SUPPORTED_CHAINS is not defined')
  })()
const RPC_URLS =
  process.env.NEXT_PUBLIC_RPC_URLS ||
  (() => {
    throw new Error('NEXT_PUBLIC_RPC_URLS is not defined')
  })()
const ORACLE_RPC_URLS = process.env.NEXT_PUBLIC_RPC_URL_FOR_ORACLES || ''
export const COMPLIANCE_PORTAL_URL =
  process.env.NEXT_PUBLIC_COMPLIANCE_PORTAL_URL || undefined
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || undefined
export const REQUIRE_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_REQUIRE_ACCESS_TOKEN === 'true'

const processConfig = (
  supportedChains: string,
  rpcUrls: string,
  oracleRpcUrls: string,
): Config => {
  const chains = supportedChains.split(',').map(Number)
  const urls = rpcUrls.split(',')
  if (urls.length !== chains.length) {
    throw new Error(
      'Length of NEXT_PUBLIC_RPC_URLS is not equal to supported chains',
    )
  }

  const rpcMap: Record<number, string> = {}
  chains.forEach((chain, index) => {
    rpcMap[chain] = urls[index]
  })

  let oracleRpcMap: Record<number, string> = {}
  if (oracleRpcUrls && !isEmpty(oracleRpcUrls.trim())) {
    const oracleUrls = oracleRpcUrls.split(',')
    if (oracleUrls.length !== chains.length) {
      throw new Error(
        'Length of NEXT_PUBLIC_ORACLE_RPC_URLS is not equal to supported chains',
      )
    }

    chains.forEach((chain, index) => {
      oracleRpcMap[chain] = oracleUrls[index]
    })
  } else {
    oracleRpcMap = rpcMap
  }

  return {
    chainId: CHAIN_ID,
    supportedChains: chains,
    rpcUrls: rpcMap,
    oracleRpcUrls: oracleRpcMap,
  }
}

const createChainConfig = (
  chainId: number,
  chainsConfig: Config,
): ChainConfig => {
  return {
    chainId: chainId,
    networkConfig: networkConfig[chainId],
    rpcUrl: chainsConfig.rpcUrls[chainId],
    oracleRpcUrl: chainsConfig.oracleRpcUrls[chainId],
    relayers: relayerConfig[chainId],
    tokens: tokenConfig[chainId],
    topTokens: tokenConfig[chainId].filter((token) => token.isTop),
    popularTokens: tokenConfig[chainId].filter((token) => token.popular),
  }
}

export const chainsConfig: Config = processConfig(
  SUPPORTED_CHAINS,
  RPC_URLS,
  ORACLE_RPC_URLS,
)

export const config = createChainConfig(CHAIN_ID, chainsConfig)
