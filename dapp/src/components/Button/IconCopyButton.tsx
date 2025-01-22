import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import { useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import DoneIcon from '@mui/icons-material/Done'

export interface IconCopyButtonProps {
  text: string
}

export const IconCopyButton: React.FC<IconCopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false)
  return (
    <CopyToClipboard text={text}>
      {!copied ? (
        <ContentCopyRoundedIcon
          sx={{
            fontSize: '20px',
            cursor: 'pointer',
          }}
          onClick={() => setCopied(true)}
        />
      ) : (
        <DoneIcon
          sx={{
            fontSize: '20px',
          }}
        />
      )}
    </CopyToClipboard>
  )
}
