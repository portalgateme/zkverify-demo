import { Box, Button, useMediaQuery, useTheme } from '@mui/material'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { formatWalletHash } from '../../helpers'
import { WalletDialog } from '../Dialog'
import { UserDashboardPopover } from '../Popover'


export const WalletConnectButton: React.FC = () => {
  const { address } = useAccount()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [openWalletDialog, setOpenWalletDialog] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [key, setKey] = useState<number>(Date.now())

  const [openPopup, setOpenPopup] = useState(false)

  const handleOpenUserDashboard = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setAnchorEl(event.currentTarget)
    setOpenPopup(true)
  }

  const onClickButtonConnect = () => {
    setOpenWalletDialog(true)
  }

  const handlePopupClose = () => {
    setOpenPopup(false)
    setAnchorEl(null)
  }


  return (
    <Box key={key}>
      {address ? (
        <Box>
          <Button
            variant="contained"
            onClick={handleOpenUserDashboard}
            sx={{
              height: '48px',
              padding: '10px 20px',
              lineHeight: '20px',
              fontSize: '14px',
              textTransform: 'none',
              borderRadius: '50px',
            }}
          >
            {formatWalletHash(address, 4)}
          </Button>
        </Box>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={onClickButtonConnect}
          sx={{
            height: '48px',
            padding: '10px 20px',
            lineHeight: '20px',
            fontSize: '14px',
            textTransform: 'none',
            borderRadius: '50px',
          }}
        >
          {isMobile ? 'Connect' : 'Connect Wallet'}
        </Button>
      )}
      <WalletDialog
        open={openWalletDialog}
        onClose={() => setOpenWalletDialog(false)}
      />
      <UserDashboardPopover
        open={openPopup}
        anchorEl={anchorEl}
        onClose={handlePopupClose}
      />
    </Box>
  )
}
