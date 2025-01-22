import {
  Box,
  Drawer,
  List,
  Stack
} from '@mui/material'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { MenuButton } from '../Button/MenuButton'
import logo from '/public/logo.svg'

const navMenu = [
  {
    id: "1",
    title: 'Deposit & Withdraw',
    href: '/depositwithdraw',
    icon: '/images/menu/deposit.svg',
    iconInactive: '/images/menu/deposit-inactive.svg',
  }
]

export const LeftMenuDrawer: React.FC<{
  activeMenu: string
  drawerWidth: number
  toogle: number
}> = ({ activeMenu, drawerWidth, toogle }) => {

  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)

  const getNavOfCurrentChain = () => {
    return navMenu
  }

  const handleDrawerClose = () => {
    setIsClosing(true)
    setMobileOpen(false)
  }

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false)
  }

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen)
    }
  }

  useEffect(() => {
    handleDrawerToggle()
  }, [toogle])

  const drawer = (
    <Box component="nav">
      <Stack
        direction={'row'}
        sx={{
          padding: '4px 8px',
          height: '36.7px',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Box
          sx={{
            borderRadius: 9999,
          }}
        >
          <Image
            src={logo}
            alt={'Singularity Logo'}
            priority={true}
          />
        </Box>
      </Stack>
      <nav>
        <List
          disablePadding
          sx={{
            width: '249px',
            gap: '28px',
            mt: '32px',
          }}
        >
          {getNavOfCurrentChain().map((menu, index) => (
            <MenuButton
              key={menu.id}
              href={menu.href}
              title={menu.title}
              icon={activeMenu == menu.id ? menu.icon : menu.iconInactive}
              active={activeMenu == menu.id}
              highlight={false}
            />
          ))}
        </List>
      </nav>
    </Box>
  )


  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          padding: '32px',
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            zIndex: '1049',
            boxSizing: 'border-box',
            width: drawerWidth,
            background: '#17181C',
            color: '#fff',
            padding: '32px',
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            zIndex: '1049',
            boxSizing: 'border-box',
            width: drawerWidth,
            background: '#17181C',
            color: '#fff',
            padding: '32px',
          },
        }}
        open
      >
        <Stack direction="column" height={'100%'}>
          <Box height={'100%'}>{drawer}</Box>
        </Stack>
      </Drawer>
    </Box>
  )
}
