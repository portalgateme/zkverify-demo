import { createContext } from "react"
import { useAccount, useChainId } from "wagmi"
import { chainsConfig, config } from "../../constants"
import { useRouter } from "next/router"

interface Props {
    children: React.ReactNode
}

export interface ChainContextProps {
    chainId: number,
}


export const ChainContext = createContext<ChainContextProps>({
    chainId: config.chainId,
})

const ChainProvider: React.FC<Props> = ({ children }) => {
    const router = useRouter();
    const getChainFromParam = (chainParam: string | string[] | undefined) => {
        if (!chainParam || typeof chainParam != 'string') {
            return undefined
        }
        try {
            const tmpChainId = parseInt(chainParam)
            if (chainsConfig.supportedChains.includes(tmpChainId)) {
                return tmpChainId
            } else {
                return undefined
            }
        } catch (e) {
            return undefined
        }
    }

    const chainParam = getChainFromParam(router.query.chain);

    const { isConnected } = useAccount()
    const chainId = useChainId()
    const currentChainId = isConnected ? chainId : chainParam ? chainParam : config.chainId

    return (
        <ChainContext.Provider
            value={{
                chainId: currentChainId,
            }}
        >
            {children}
        </ChainContext.Provider>
    )
}

export default ChainProvider