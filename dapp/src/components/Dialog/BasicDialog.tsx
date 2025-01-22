import React from 'react'
import {
  Dialog,
  DialogTitle,
  IconButton,
  useTheme,
  Box,
  Typography,
} from '@mui/material'
import { BasicDialogProps } from './model'
import { Close } from '@mui/icons-material'

export const BasicDialog: React.FC<BasicDialogProps> = ({
  open,
  onClose,
  children,
  dialogTitle,
  PaperProps,
}) => {
  const theme = useTheme()

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          onClose()
        }
      }}
      PaperProps={PaperProps}
    >
      {dialogTitle && (
        <DialogTitle>
          <Box width={'600px'}>
            <Typography
              variant="h3"
              color={theme.palette.text.secondary}
              textTransform="uppercase"
            >
              {dialogTitle}
            </Typography>
          </Box>
          <IconButton
            size="medium"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme.palette.text.primary,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
      )}
      {children}
    </Dialog>
  )
}