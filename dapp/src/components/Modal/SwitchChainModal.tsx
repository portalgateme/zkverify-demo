import {
  Box,
  ModalProps,
  Typography,
  useTheme
} from '@mui/material'
import React from 'react'
import { supportedChains } from '../../constants/chains'
import { ModalButton } from '../Button/ModalButton'
import { BasicModal } from './BasicModal'
import { useSwitchChain } from 'wagmi'
import Image from 'next/image'
import { useChainContext } from '../../contexts/ChainContext/hooks'

export const SwitchChainModal: React.FC<ModalProps> = ({
  open,
  onClose
}) => {
  const theme = useTheme()
  const { chainId } = useChainContext()
  const { switchChain } = useSwitchChain()

  const doSwitchChain = async () => {
    switchChain({ chainId: chainId })
  }

  return (
    <BasicModal
      open={open}
      onClose={onClose}
      scroll={'paper'}
      maxWidth={'md'}
      sx={{
        '& .MuiDialog-paper': {
          width: '659px',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
          gap: theme.spacing(2),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: theme.spacing(3),
          }}
        >
          <Image src="/images/info.svg" width={50} height={50} alt="" />
          <Typography
            variant="h3"
            color={theme.palette.common.white}
            mb={1}
            sx={{
              textAlign: 'center',
            }}
          >
            Sorry, we don't support this chain at the moment. Please switch to {supportedChains[chainId]?.name}
          </Typography>
        </Box>

        <Box
          display={'flex'}
          alignItems={'center'}
          flexDirection={'column'}
          gap={theme.spacing(2)}
        >
          <ModalButton
            onClick={doSwitchChain}
            title={'Switch to ' + supportedChains[chainId]?.name}
            loading={false}
            disabled={false}
          />
        </Box>
      </Box>
    </BasicModal>
  )
}
