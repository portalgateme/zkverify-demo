import React from 'react'
import { Box, useTheme, Tooltip, Stack, Typography } from '@mui/material'
import { NoteProps } from './Copy'
import DownloadIcon from '@mui/icons-material/Download'
import { saveAsFile } from '../../helpers'
import { ModalSmallButton } from '../Button/ModalButton'

export const Save: React.FC<NoteProps> = ({
  placement,
  note,
  display,
  compact = false,
  type = 'primary',
}) => {
  const theme = useTheme()
  const data = new Blob([note], { type: 'text/plain;charset=utf-8' })
  const saveFile = () =>
    saveAsFile(data, `backup-${display}.txt`)

  const backgroundColor = () => {
    switch (type) {
      case 'primary':
        return undefined

      case 'secondary':
        return 'transparent'
    }
  }

  const textColor = () => {
    switch (type) {
      case 'primary':
        return theme.palette.secondary.main

      case 'secondary':
        return theme.palette.other.primary.p50
    }
  }
  return (
    <ModalSmallButton
      onClick={saveFile}
      sx={{
        backgroundColor: backgroundColor(),
      }}
    >
      <Stack
        alignItems={'center'}
        justifyContent={'center'}
        direction={'row'}
        gap={theme.spacing(1)}
      >
        <DownloadIcon
          sx={{
            width: '18px',
            height: '18px',
            margin: '0 1px',
            color: textColor(),
          }}
        />
        {!compact && (
          <Typography variant="button-sm" fontWeight={600} color={textColor()}>
            Download TXT File
          </Typography>
        )}

      </Stack>
    </ModalSmallButton>
  )
}
