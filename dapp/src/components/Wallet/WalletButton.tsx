import { styled, Button } from '@mui/material'

export const WalletButton = styled(Button)(({ theme }) => {
    return {
        background: '#17181C',
        color: theme.palette.common.white,
        textTransform: 'none',
        width: '100%',
        disableRipple: true,
        variant: "contained",
        disableFocusRipple: true,
        borderRadius: '9999px',
        border: '1px solid #1D5A2B',
        height: '65px',
        padding: '12px, 36px',
        gap: theme.spacing(1),
        textAlign: 'center',
        ":hover": {
            background: '#92F1A7',
            color: theme.palette.secondary.main,
        },
    }
})