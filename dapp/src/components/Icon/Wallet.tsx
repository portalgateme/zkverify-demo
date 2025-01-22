import React from 'react'
import Image, { StaticImageData } from 'next/legacy/image'
import { Box } from '@mui/material'

interface Props {
  src: string | StaticImageData
}

export const Wallet: React.FC<Props> = ({ src }) => {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '5px',
      }}
    >
      <Image width={32} height={32} src={src} alt={'Wallet Image'} priority={true} />
    </Box>
  )
}