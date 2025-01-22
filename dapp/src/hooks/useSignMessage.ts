import { useSignTypedData } from 'wagmi'

export const useSignMessage = () => {
  const { signTypedDataAsync } = useSignTypedData()

  const signMessageAsync = async () => {
    return await signTypedDataAsync({
      types: {
        'Zero Knowledge Proof Key Creation': [
          { name: 'action', type: 'string' }
        ],
      },
      primaryType: 'Zero Knowledge Proof Key Creation',
      message: {
        action:
          "Please sign this message to create your own Zero Knowledge proof key-pair",
      },
    })
  }

  return { signMessageAsync }
}