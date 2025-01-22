import AssetManagerAbi from '../../abis/darkpool/DarkpoolAssetManager.json'
import { writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core'
import { hexlify32, isNotNativeCurrencyByChain } from '../../helpers/utils'
import ERC20Abi from '../../abis/IERC20.json'
import USDTERC20Abi from '../../abis/IERC20_USDT.json'
import { wagmiConfig } from '../../wagmi'
import { HexData, NoteAction, TokenConfig } from '../../types'
import { legacyTokenConfig } from '../../constants/tokenConfig'
import { noteToSecretsByChain } from '../secretService'
import { networkConfig } from '../../constants/networkConfig'
import { createNote, generateDepositProof, Note, PROOF_DOMAIN } from '../../proof'
import { submitProofToRelayer } from '../zkVerify/submitProof'
import { VK_HASHES } from '../../proof/vk'
import { getRelayer, pollJobData } from '../relayerService'

export const MAX_ALLOWANCE = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");  // 2**256 - 1

export async function prepareAction(
  amount: bigint,
  asset: TokenConfig,
  signature: string,
  chainId: number
) {
  const note = await createNote(asset.address, amount, signature)
  const noteSecret = noteToSecretsByChain(note, asset, NoteAction.DEPOSIT, chainId)
  return { note, noteSecret }
}

export async function executeAction(note: Note, address: string, signature: string, chainId: number) {
  const depositProofResult = await generateDepositProof({
    note: note,
    signedMessage: signature,
    address: address,
  })

  const relayer = getRelayer(chainId)
  const jobId = await submitProofToRelayer(
    depositProofResult.proof.proof,
    depositProofResult.proof.verifyInputs,
    VK_HASHES[PROOF_DOMAIN.DEPOSIT],
    relayer
  )

  const data = await pollJobData(jobId, relayer.hostUrl)

  if (data.error) {
    throw new Error(data.error)
  } else if (!data.result) {
    throw new Error('Proof submission failed')
  }

  console.log(note, data.result, depositProofResult)

  if (note.asset && isNotNativeCurrencyByChain(note.asset, chainId)) {
    const allowance = await readContract(wagmiConfig, {
      address: note.asset as HexData,
      abi: ERC20Abi.abi,
      functionName: 'allowance',
      args: [address, networkConfig[chainId].darkpoolAssetManager],
    })
    const isLegacy = legacyTokenConfig.hasOwnProperty(chainId) && legacyTokenConfig[chainId].includes(
      note.asset.toLowerCase(),
    )
    if (Number(allowance) < note.amount) {
      const erc20Result = await writeContract(wagmiConfig, {
        address: note.asset as HexData,
        abi: isLegacy ? USDTERC20Abi.abi : ERC20Abi.abi,
        functionName: 'approve',
        args: [
          networkConfig[chainId].darkpoolAssetManager,
          hexlify32(MAX_ALLOWANCE)
        ],
      })
      await waitForTransactionReceipt(wagmiConfig, {
        hash: erc20Result,
      });
    }

    return await writeContract(wagmiConfig, {
      address: networkConfig[chainId].darkpoolAssetManager,
      abi: AssetManagerAbi.abi,
      functionName: 'depositERC20',
      args: [
        note.asset,
        hexlify32(note.amount),
        hexlify32(note.note),
        depositProofResult.noteFooter,
        data.result
      ],
    })
  } else {
    return await writeContract(wagmiConfig, {
      address: networkConfig[chainId].darkpoolAssetManager,
      abi: AssetManagerAbi.abi,
      functionName: 'depositETH',
      args: [
        hexlify32(note.note),
        depositProofResult.noteFooter,
        data.result
      ],
      value: note.amount,
    })
  }
}
