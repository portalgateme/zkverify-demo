import { ethers } from 'ethers'
import numeral from 'numeral'
import { formatDate } from '../helpers'
import { Note } from '../proof'
import { TokenConfig } from '../types'

function removeSpecialCharInSymbol(symbol: string): string {
  return symbol.replace(/[-\\/]/g, '')
}

export function abbreviateAmount(amount: bigint, decimals: number) {
  if (amount >= BigInt(10 ** decimals)) {
    return numeral(ethers.utils.formatUnits(amount, decimals)).format(
      '0.0a',
      Math.floor,
    )
  } else if (amount >= BigInt(10 ** (decimals - 4))) {
    return numeral(ethers.utils.formatUnits(amount, decimals)).format(
      '0.0000a',
      Math.floor,
    )
  } else {
    return numeral(ethers.utils.formatUnits(amount, decimals)).format(
      '0.0e+0',
      Math.floor,
    )
  }
}

export function noteToSecretsByChainAndTimestamp(
  note: Note,
  token: TokenConfig,
  action: string,
  chainId: number,
  timestamp: number,
) {
  const amount = abbreviateAmount(note.amount, token.decimals)
  const symbol = removeSpecialCharInSymbol(token.symbol)
  const date = formatDate(new Date(timestamp))
  return `${amount}-${symbol}-${date}-${action}-sg20-${chainId}-${note.asset.toLowerCase()}-${note.amount
    }-${note.rho}-${note.note}`
}

export function noteToSecretsByChain(
  note: Note,
  token: TokenConfig,
  action: string,
  chainId: number,
) {
  return noteToSecretsByChainAndTimestamp(
    note,
    token,
    action,
    chainId,
    Date.now(),
  )
}


export function getDisplayOfSecrets(noteSecrets: string): string {
  if (!noteSecrets) {
    return ''
  }
  const index20 = noteSecrets.indexOf('-sg20-')
  if (index20 !== -1) {
    return noteSecrets.substring(0, index20)
  } else {
    const index721 = noteSecrets.indexOf('-sg721-')
    if (index721 !== -1) {
      return noteSecrets.substring(0, index721)
    } else {
      return noteSecrets
    }
  }
}