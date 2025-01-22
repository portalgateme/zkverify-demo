import React, { useState } from 'react'
import { useTheme, ListItemButton, ListItemIcon, ListItemText, ListItem, Typography, Box } from '@mui/material'
import Link from 'next/link'


export interface MenuProp {
    title: string,
    href: string,
    icon: string,
    active: boolean,
    highlight?: boolean
}

export const MenuButton: React.FC<MenuProp> = ({ title, href, icon, active = false, highlight }) => {

    const theme = useTheme()
    const inActiveColor = highlight ? '#77ED91' : '#FFF'

    if (active) {
        return (
            <ListItem sx={{
                height: '48px',
                background: '#FFF',
                borderRadius: '25px',
                border: '2px rgba(119, 237, 145, 0.78) solid',
                mt: '28px',
                padding: '12px 20px'
            }} >
                <Box
                    sx={{
                        width: '24px',
                        height: '24px',
                        borderRadius: 20,
                        background: '#1A1D1E',
                        ml: '3px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex'
                    }}>
                    <Box
                        sx={{
                            width: '14px',
                            height: '14px',
                            padding: '0px 0px',
                            background: '#1A1D1E',
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex'
                        }}
                    ><img width={14} height={15} src={icon} alt={''} />
                    </Box>
                </Box>
                <ListItemText sx={{ ml: '8px' }} primary={
                    <Typography noWrap color={theme.palette.common.black}>
                        {title}
                    </Typography>
                } />
            </ListItem >
        )
    }
    else {
        return (
            <Box mt={'28px'}>
                <Link href={href}>
                    <ListItem sx={{ height: '48px', padding: '12px 22px' }} >
                        <ListItemButton sx={{ padding: '0px 0px' }}>
                            <Box
                                sx={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: 20,
                                    background: inActiveColor,
                                    ml: '3px',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    display: 'flex'
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '14px',
                                        height: '14px',
                                        padding: '0px 0px',
                                        background: inActiveColor,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        display: 'flex',
                                        color: '#17181C',
                                    }}
                                >
                                    <img width={14} height={15} src={icon} alt={''} />
                                    {/* {icon} */}
                                </Box>
                            </Box>
                            <ListItemText sx={{ ml: '8px' }} primary={
                                <Typography noWrap color={inActiveColor}>
                                    {title}
                                </Typography>
                            } />
                        </ListItemButton>
                    </ListItem>
                </Link>
            </Box>
        )
    }
}