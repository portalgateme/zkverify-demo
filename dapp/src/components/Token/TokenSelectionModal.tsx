import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import TokenIcon from '@mui/icons-material/Token'
import {
    Avatar,
    Box,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputBase,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Paper,
    Stack,
    Typography,
    useTheme
} from '@mui/material'
import { ethers } from 'ethers'
import { isEmpty } from 'lodash'
import React, { ChangeEvent, useCallback, useEffect } from 'react'
import { tokenConfig } from '../../constants/tokenConfig'
import { useChainContext } from '../../contexts/ChainContext/hooks'
import { formatWalletHash } from '../../helpers'
import { isNotNativeCurrencyByChain } from '../../helpers/utils'
import useDebounce from '../../hooks/useDebounce'
import { getTokenByChain } from '../../services/tokenSerivce'
import { TokenConfig } from '../../types'
import { BasicModal } from '../Modal/BasicModal'

export interface TokenSelectionModalProp {
    openState: boolean,
    onClose: () => void,
    onAssetChange: (token: TokenConfig) => void,
    disableNative?: boolean
}

export const TokenSelectionModal: React.FC<TokenSelectionModalProp> = ({ openState, onClose, onAssetChange, disableNative = false }) => {

    const theme = useTheme()
    const { chainId } = useChainContext()

    const [searchResult, setSearchResult] = React.useState<TokenConfig[]>()
    const [isSearching, setIsSearching] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState<string>('')
    const debouncedQuery = useDebounce(searchQuery, 500)


    const getPopularTokens = (tokens: TokenConfig[] | undefined) => {
        if (!tokens)
            return []
        const result = tokens.filter(token => token.popular)

        return disableNative ? result.filter(token => isNotNativeCurrencyByChain(token.address, chainId)) : result
    }

    const getTopTokens = (tokens: TokenConfig[] | undefined) => {
        if (!tokens)
            return []
        const result = tokens.filter(token => token.isTop)
        return disableNative ? result.filter(token => isNotNativeCurrencyByChain(token.address, chainId)) : result
    }

    const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target.value.trim()
        setSearchQuery(input)
    }, [])

    useEffect(() => {
        if (openState) {
            setSearchResult(getPopularTokens(tokenConfig[chainId]))
            setIsSearching(false)
        }
    }, [openState]);

    useEffect(() => {
        onSearchChange(debouncedQuery)
    }, [debouncedQuery]);

    const onSearchChange = async (searchString: string) => {
        if (!isEmpty(searchString)) {
            setIsSearching(true)
            if (ethers.utils.isAddress(searchString)) {
                const tokenConfig = await getTokenByChain(searchString, chainId);
                if (tokenConfig)
                    setSearchResult([tokenConfig])
                else {
                    setSearchResult([])
                }
            } else {
                const lowerCaseSearchString = searchString.toLowerCase();
                const tmpResult = tokenConfig[chainId].filter((token) => {
                    const lowerCaseSymbol = token.symbol.toLowerCase();
                    const lowerCaseName = token.name.toLowerCase();
                    return lowerCaseSymbol.includes(lowerCaseSearchString) || lowerCaseName.includes(lowerCaseSearchString);
                });
                setSearchResult(tmpResult)
            }
        } else {
            setIsSearching(false)
            setSearchResult(getPopularTokens(tokenConfig[chainId]))
        }
    }

    return (
        <BasicModal
            open={openState}
            onClose={onClose}
            scroll={'paper'}
            maxWidth={'md'}
        >
            <DialogTitle id="tokenSelectionDialogTitle" sx={{ padding: '0px', mb: '16px', height: '23px' }}>
                <Stack width={'100%'} direction={'row'}
                    sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                    <Typography variant='h4' color={theme.palette.common.white} width={"100%"}>
                        Select a token
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                            width: '24px',
                            height: '24px',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent sx={{ width: '462px', padding: '0px' }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '16px',
                        flexShrink: '0',
                    }}
                >
                    <Paper sx={{
                        p: '10px 13px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '40px'
                    }}>
                        <SearchIcon sx={{
                            width: '20px',
                            height: '20px',
                            color: '#9B9B9B'
                        }} />
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Search name or paste address"
                            inputProps={{ 'aria-label': 'Search name or paste address' }}
                            onChange={handleInput}
                            disabled={false}
                        />
                    </Paper>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                    }}>
                        {getTopTokens(tokenConfig[chainId]).map((token) => (
                            <Button key={token.symbol}
                                onClick={() => { onAssetChange(token) }}
                                component="label"
                                variant="contained"
                                startIcon={token.logoURI ?
                                    <Avatar sx={{ background: 'transparent', width: '24px', height: '24px' }}>
                                        <img src={token.logoURI} width={'24px'} height={'24px'} />
                                    </Avatar>
                                    : <Avatar sx={{ background: 'transparent', width: '24px', height: '24px' }}>
                                    </Avatar>}
                                sx={{
                                    height: '48px',
                                    padding: '12px 20px',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: '9999px',
                                    border: '1px solid #576E63',
                                    background: '#17181C',
                                    color: theme.palette.common.white,
                                    '&:hover': {
                                        backgroundColor: '#2C2D31',
                                    },
                                }}>
                                {token.symbol}
                            </Button>
                        ))}

                    </Box>
                    <Divider sx={{ width: '100%', background: '#BBD0C5' }} />
                    <Box>
                        <Typography variant='h4' color={theme.palette.common.white} width={"100%"}>
                            {!isSearching ? "Popular tokens" : "Search Results"}
                        </Typography>
                    </Box>
                    <Box width={'100%'}>
                        <List disablePadding>
                            {searchResult?.map((token, index) => (
                                <ListItem key={index} disablePadding>
                                    <ListItemButton
                                        onClick={() => { onAssetChange(token) }}
                                        sx={{
                                            padding: '8px 0px',
                                            height: '56px',
                                            '&:hover': {
                                                backgroundColor: '#2C2D31',
                                            },
                                        }}>
                                        <ListItemAvatar>
                                            {token.logoURI ? (
                                                <Avatar sx={{ background: '#2C2D31', width: '36px', height: '36px' }}>
                                                    <img src={token.logoURI} width={'36px'} height={'36px'} />
                                                </Avatar>
                                            ) : (
                                                <Avatar sx={{ background: '#17181C', width: '36px', height: '36px' }}>
                                                    <TokenIcon sx={{ color: '#2C2D31', width: '36px', height: '36px' }} />
                                                </Avatar>
                                            )}
                                        </ListItemAvatar>
                                        <ListItemText primary={token.name}
                                            secondaryTypographyProps={{
                                                component: 'div',
                                            }}
                                            secondary={
                                                <Stack direction={'row'} gap={theme.spacing(1)}>
                                                    <Typography variant="body2" sx={{ color: '#E8EFEC' }}>
                                                        {token.symbol}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: theme.palette.grey[500] }}>
                                                        {formatWalletHash(token.address, 4)}
                                                    </Typography>
                                                </Stack>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>

                    </Box>
                </Box>
            </DialogContent>
            <DialogActions></DialogActions>
        </BasicModal>
    )
}