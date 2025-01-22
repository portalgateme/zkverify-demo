import { Check } from "@mui/icons-material"
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Box, Menu, MenuItem, Stack, Typography } from "@mui/material"
import Image from 'next/image'
import { useState } from "react"
import { useAccount, useSwitchChain } from "wagmi"
import { chainsConfig } from "../../constants"
import { supportedChains } from "../../constants/chains"
import { useChainContext } from "../../contexts/ChainContext/hooks"
import { useRouter } from "next/router"


export const ChainSwitchButton: React.FC = () => {

    const router = useRouter();
    const { switchChainAsync } = useSwitchChain()
    const { isConnected } = useAccount()
    const { chainId: currentChainId } = useChainContext()

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl)

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
        setOpenPopup(true)
    }

    const handleClose = () => {
        setAnchorEl(null);
        setOpenPopup(false)
    }

    const isChainIdParamExists = () => {
        if (!router.query.chain || typeof router.query.chain != 'string') {
            return false
        }

        try {
            const tmpChainId = parseInt(router.query.chain)
            if (chainsConfig.supportedChains.includes(tmpChainId)) {
                return true
            } else {
                return false
            }
        } catch (e) {
            return false
        }
    }

    const handleSwitchChain = async (chainId: number) => {
        if (!isConnected) {
            const newParams = { ...router.query, chain: chainId };
            router.push({ query: newParams }, undefined, { shallow: true });
        } else {
            if (isChainIdParamExists()) {
                const { query } = router;
                delete query.chain;
                router.push({ query }, undefined, { shallow: true });
            }
        }

        await switchChainAsync({ chainId })
        handleClose()
    }

    const [openPopup, setOpenPopup] = useState(false)

    const currentChainConfig = supportedChains[currentChainId]

    const isCurrentChainSupported = chainsConfig.supportedChains.includes(currentChainId)

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    width: '116px',
                    height: '48px',
                    padding: '12px 20px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: '9999',
                    background: 'rgba(119, 237, 145, 0.00)',
                    color: "white",
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: 'rgb(47, 60, 53)',
                        borderRadius: '9999',
                        padding: '12px 20px',
                    },
                }}
                onClick={handleClick}
            >
                <Box width={24} height={24}>
                    {isCurrentChainSupported ?
                        (<Image width={24} height={24} src={currentChainConfig.icon} alt="" />) :
                        (<WarningAmberIcon />)
                    }
                </Box>
                <Box width={24} height={24}>
                    {openPopup ? (<ExpandLessIcon />) : (<ExpandMoreIcon />)}
                </Box>
            </Box >
            <Menu
                id="chains-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                    sx: {
                        background: '#17181C',
                        color: 'white',
                    },
                }}
            >
                {chainsConfig.supportedChains.map((chainId) => (
                    <MenuItem onClick={() => handleSwitchChain(chainId)} key={chainId}
                        sx={{
                            '&:hover': {
                                backgroundColor: 'rgb(47, 60, 53)',
                            },
                        }}
                    >
                        <Stack direction="row" width="100%" gap="12px">
                            <Box
                                sx={{
                                    width: '20px',
                                    height: '20px',
                                    padding: '0px 0px',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    display: 'flex'
                                }}
                            ><img width={20} height={20} src={supportedChains[chainId].icon} alt={''} />
                            </Box>
                            <Typography variant="body2" width={'100%'}>
                                {supportedChains[chainId].name}
                            </Typography>
                            <Box width={20} height={20}>
                                {chainId === currentChainId ? (
                                    <Box color={'white'} width={20} height={20}>
                                        <Check sx={{ width: '18px', height: '18px' }} />
                                    </Box>
                                ) : null}
                            </Box>
                        </Stack>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    )
}