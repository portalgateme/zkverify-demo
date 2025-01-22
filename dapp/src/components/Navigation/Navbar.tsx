import React, { useState, useEffect } from 'react'
import { Box, IconButton, Toolbar, Stack, Typography, AppBar, useTheme, useMediaQuery } from '@mui/material'
import { Menu as MenuIcon, Close } from '@mui/icons-material'
import { WalletConnectButton } from '../Button'
import { ChainSwitchButton } from '../Button/ChainSwitchButton'


interface NavbarProps {
  title: string,
  drawerWidth: number,
  onToogle: () => void
}

const Navbar: React.FC<NavbarProps> = ({ title, drawerWidth, onToogle }) => {
  const theme = useTheme()

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: '1049',
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        background: '#0D0D0D', boxShadow: 'none',
        height: '131px',
        padding: '32px 8px'
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0px' }} >
        <Box
          display="flex"
          color={theme.palette.common.white}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onToogle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h1" noWrap component="div">
            {title}
          </Typography>
        </Box>
        <Box>
          <Stack direction={'row'}>
            <ChainSwitchButton />
            <WalletConnectButton />
          </Stack>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
