import {
  Box,
  Card,
  FormControl,
  Stack,
  styled,
  Typography,
  useTheme,
} from '@mui/material'
import BN from 'bignumber.js'
import { ethers } from 'ethers'
import { isEmpty } from 'lodash'
import React, { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import { useToast } from '../../contexts/ToastContext/hooks'
import { formatContractError } from '../../helpers'
import {
  isNativeCurrencyByChain,
  isNotNativeCurrencyByChain,
} from '../../helpers/utils'
import { useSignMessage } from '../../hooks/useSignMessage'
import { Note } from '../../proof'
import {
  executeAction,
  prepareAction,
} from '../../services/darkpool/depositService'
import { getDisplayOfSecrets } from '../../services/secretService'
import { DarkpoolError, HexData, TokenConfig } from '../../types'
import { InfoAlert } from '../Alert/InfoAlert'
import { AlignedRow } from '../Box/AlignedRow'
import { LoadingExtButton } from '../Button/LoadingButton'
import { AssetAmountInput } from '../Input/AssetAmountInput'
import { GeneralSuccessModal } from '../Modal/GeneralSuccessModal'
import { SecretModal } from '../Modal/SecretModal'

export const StyledCard = styled(Card)(() => {
  return {
    boxShadow: 'none',
    width: '648px',
    minHeight: '265px',
  }
})

export const Deposit: React.FC = () => {
  const theme = useTheme()
  const { signMessageAsync } = useSignMessage()
  const [loading, setLoading] = useState(false)
  const { showPendingToast, showSuccessToast, closeToast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const {
    address,
    connector: activeConnector,
    isConnected,
    // chainId,
  } = useAccount()
  const { chainId } = useChainContext()
  const [signature, setSignature] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [showSecretModal, setShowSecretModal] = useState<boolean>(false)
  const [key, setKey] = useState<number>(Date.now())
  const account = useAccount()
  // const { isCompliant } = useCompliance()

  const [asset, setAsset] = useState<TokenConfig>()
  const [amount, setAmount] = useState<number>()
  const [displayAmount, setDisplayAmount] = useState<string>('')

  const [noteSecret, setNoteSecret] = useState<string>('')
  const [note, setNote] = useState<Note | null>(null)

  const [ethTx, setEthTx] = useState<string>('')

  const { data } = useBalance({
    address: account.address,
    token: asset
      ? isNotNativeCurrencyByChain(asset.address, chainId)
        ? (asset.address as HexData)
        : undefined
      : undefined,
  })

  const formatBalance = () => {
    if (!data || !asset) {
      return ''
    }
    return Number(ethers.utils.formatUnits(data.value, data.decimals)).toFixed(
      4,
    )
  }

  const handleAssetChange = (value: TokenConfig) => {
    setError(null)
    setAsset(value)
  }

  const handleAmountChange = (value: string) => {
    setDisplayAmount(value)
    if (asset && +value > Number(formatBalance())) {
      setError('Not enough balance for ' + asset.symbol)
    } else {
      setError(null)
      if (!isNaN(Number(value))) {
        const amount = parseFloat(value)
        if (amount <= 0) {
          setError('Amount must be greater than 0')
          return
        }
        setAmount(parseFloat(value))
      } else {
        setAmount(undefined)
      }
    }
  }

  const onReset = () => {
    console.log('onreset')
    setShowSuccessModal(false)
    setKey(Date.now())
  }

  const createSecretModal = () => {
    return (
      <SecretModal
        openState={showSecretModal}
        onClose={handleNoteModalClose}
        secret={noteSecret}
        display={getDisplayOfSecrets(noteSecret)}
        secretTitle={'Private Note'}
        onProceed={doDeposite}
        proceedActionTitle={'Proceed with deposit'}
        loading={loading}
      />
    )
  }

  const prepare = async () => {
    if (!amount || !asset) {
      setError('Please enter the amount and select a token')
      return
    }

    if (!isConnected || !activeConnector || !address || !chainId) {
      setError('No wallet connected!')
      return
    }

    const amountBN = BigInt(
      new BN(amount).multipliedBy(new BN(10).pow(asset.decimals)).toFixed(0, 1),
    )

    setError(null)
    setLoading(true)
    showPendingToast(undefined, 'Signing Message')

    try {
      const signature = await signMessageAsync()
      setSignature(signature)

      const { note, noteSecret } = await prepareAction(
        amountBN,
        asset,
        signature,
        chainId,
      )
      setNote(note)
      setNoteSecret(noteSecret)
      setShowSecretModal(true)
    } catch (error: any) {
      if (error instanceof DarkpoolError) {
        setError(error.message)
      } else {
        setError(formatContractError(error.message))
      }
      console.error(
        'Deposit error on preparation: ',
        error.message,
        error.stack,
      )
    } finally {
      setLoading(false)
      closeToast()
    }
  }

  const doDeposite = async () => {
    setShowSecretModal(false)

    if (note === null || !address || signature === null || !chainId) {
      setError('Error occur, please back to previous step and retry!')
      return
    }

    setError(null)
    setLoading(true)
    showPendingToast(
      undefined,
      'Generating ZK Proof',
      'Usually takes 1-3 minutes',
    )

    try {
      const depositResult = await executeAction(
        note,
        address,
        signature,
        chainId,
      )

      setEthTx(depositResult)
      showSuccessToast(depositResult)
      setShowSecretModal(false)
      setShowSuccessModal(true)
    } catch (error: any) {
      console.error('deposit error: ', error.message, error.stack)
      setError(formatContractError(error.message))
      closeToast()
    } finally {
      setLoading(false)
    }
  }

  const handleNoteModalClose = () => {
    setShowSecretModal(false)
  }

  const onClickMaxBalance = () => {
    if (data && asset) {
      if (isNativeCurrencyByChain(asset.address, chainId)) {
        const gasFee = 0.001 // Adjust the gas fee amount as needed
        const maxBalance = Number(
          ethers.utils.formatUnits(data.value, data.decimals),
        )
        const maxAmount = maxBalance - gasFee
        setDisplayAmount(maxAmount.toString())
      } else {
        setDisplayAmount(
          Number(
            ethers.utils.formatUnits(data.value, data.decimals),
          ).toString(),
        )
      }
    }
  }

  return (
    <StyledCard key={key}>
      <FormControl disabled={loading || !isConnected} fullWidth>
        <Box>
          <Box
            component={'div'}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '265px',
              gap: theme.spacing(1),
            }}
          >
            <AssetAmountInput
              onAssetChange={handleAssetChange}
              onAmountChange={handleAmountChange}
              value={displayAmount}
            />
            {asset && (
              <Stack direction={'row'} spacing={theme.spacing(1)}>
                <Typography variant="body-sm">
                  Your Balance:{' '}
                  <b>
                    {formatBalance()} {asset?.symbol}
                  </b>
                </Typography>
                <Typography
                  variant="body-sm"
                  fontWeight={600}
                  color={theme.palette.other.primary.p50}
                  onClick={onClickMaxBalance}
                  sx={{
                    cursor: 'pointer',
                  }}
                >
                  Max
                </Typography>
              </Stack>
            )}
          </Box>

          <Box mb={theme.spacing(1)}>
            <InfoAlert
              type=""
              text="Gas costs will be deducted from user deposits and any deposits that are not enough to cover gas costs cannot be withdrawn"
            />
          </Box>

          <LoadingExtButton
            disabled={loading || !amount || !asset || !isEmpty(error)}
            loading={loading}
            title={'Continue'}
            onClick={prepare}
          />
        </Box>
      </FormControl>

      {error && (
        <Typography
          variant="body1"
          mt={2}
          sx={{ color: theme.palette.error.main }}
        >
          <strong>Notice:</strong>&nbsp;
          <span style={{ wordBreak: 'break-word' }}>{error}</span>
        </Typography>
      )}

      {showSecretModal && createSecretModal()}
      <GeneralSuccessModal
        actionTitle="Your deposit is complete"
        tx={ethTx}
        openState={showSuccessModal}
        onClose={onReset}
      >
        <AlignedRow>
          <Typography variant="body-sm">You Deposit:</Typography>
          <Typography variant="body-sm" fontWeight={600}>
            {amount?.toFixed(3)} {asset?.symbol || ''}
          </Typography>
        </AlignedRow>
      </GeneralSuccessModal>
    </StyledCard>
  )
}
