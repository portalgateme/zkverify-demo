import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { LeftMenuDrawer } from '../Drawer/LeftMenuDrawer'
import Navbar from '../Navigation/Navbar'
import { useAccount } from 'wagmi'
import { chainsConfig } from '../../constants'
import { SwitchChainModal } from '../Modal/SwitchChainModal'

interface Props {
  children?: React.ReactNode,
  title: string,
  activeMenu: string
}


const Layout: React.FC<Props> = ({ children, title, activeMenu }) => {

  const [mounted, setMounted] = useState(false)
  const drawerWidth = 313
  const [toogle, setToogle] = useState<number>(Date.now())

  const { isConnected, chainId } = useAccount()
  const needSwitchChain = isConnected && chainId && !chainsConfig.supportedChains.includes(chainId)
  const [switchModalOpen, setSwitchModalOpen] = React.useState(false)


  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (needSwitchChain) {
      setSwitchModalOpen(true)
    } else {
      setSwitchModalOpen(false)
    }
  }, [needSwitchChain])

  if (!mounted) return null

  const onToogle = () => {
    setToogle(Date.now())
  }

  return (
    <Box sx={{ display: 'flex' }} >
      <Navbar title={title} drawerWidth={drawerWidth} onToogle={onToogle} />
      <LeftMenuDrawer activeMenu={activeMenu} drawerWidth={drawerWidth} toogle={toogle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          height: '100vh',
          overflow: 'auto',
          position: 'relative',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}>
        <Box sx={{ height: '130px' }}></Box>
        <Box sx={{
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {children}
        </Box>
      </Box>
      <SwitchChainModal open={switchModalOpen} onClose={() => {  }}>
        <>
        </>
      </SwitchChainModal>
    </Box>
  )
}

export default Layout
