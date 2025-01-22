import { DialogProps } from '@mui/material'

export interface BasicDialogProps extends DialogProps {
  onClose: () => void
  dialogTitle?: string
}