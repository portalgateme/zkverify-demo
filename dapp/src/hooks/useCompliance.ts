import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { isAddressCompliant } from '../services/complianceService'

export const useComplianceCheck = (
  address: string | undefined,
  chainId: number | undefined,
) => {
  const [loading, setLoading] = useState(false)
  const [isCompliant, setIsCompliant] = useState<boolean>()
  const isNotCompliant = isCompliant === false

  useEffect(() => {
    if (
      address &&
      ethers.utils.isAddress(address) &&
      chainId
    ) {
      setLoading(true)
      isAddressCompliant(address, chainId)
        .then((isCompliant) => {
          setIsCompliant(isCompliant)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setIsCompliant(undefined)
    }
  }, [address])

  const onCheckCompliance = () => {
    if (address && ethers.utils.isAddress(address) && chainId) {
      setLoading(true)
      isAddressCompliant(address, chainId)
        .then((isCompliant) => {
          setIsCompliant(isCompliant)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  const onVerify = async (address: string, chainId: number) => {
    if (address && ethers.utils.isAddress(address) && chainId) {
      return await isAddressCompliant(address, chainId)
    }
  }

  return { loading, isCompliant, isNotCompliant, onCheckCompliance, onVerify }
}

export const useCompliance = () => {
  const chainId = useChainId()
  const { address } = useAccount()
  const {
    isCompliant,
    isNotCompliant,
    loading: checkLoading,
    onCheckCompliance,
  } = useComplianceCheck(address, chainId)

  return {
    isCompliant,
    isNotCompliant,
    isLoading: checkLoading,
    onCheckCompliance,
  }
}
