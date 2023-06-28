import { supportedWallets } from '@/providers/evm/EvmProvider'
import { getConfiguredChains } from '@/providers/utils'
import { getEvmProjectId } from '@/utils/env/client'
import { LocalStorage } from '@/utils/storage'
import { InstructionStepName } from '@rainbow-me/rainbowkit/dist/wallets/Wallet'
import { walletConnectWallet } from '@rainbow-me/rainbowkit/wallets'
import { Chain, Connector } from 'wagmi'

const WAGMI_WALLET = 'wagmi.wallet'

const walletStorage = new LocalStorage(() => WAGMI_WALLET)

export const getWalletFromStorage = () =>
  walletStorage.get()?.replace(/[^a-zA-Z ]/g, '')

export type RainbowKitConnector<C extends Connector = Connector> = {
  connector: C
  mobile?: {
    getUri?: () => Promise<string>
  }
  desktop?: {
    getUri?: () => Promise<string>
  }
  qrCode?: {
    getUri: () => Promise<string>
    instructions?: {
      learnMoreUrl: string
      steps: {
        step: InstructionStepName
        title: string
        description: string
      }[]
    }
  }
  extension?: {
    instructions?: {
      learnMoreUrl: string
      steps: {
        step: InstructionStepName
        title: string
        description: string
      }[]
    }
  }
}

const getWallet = (chains: Chain[]) => {
  const currentWalletId = getWalletFromStorage()

  const wallet = currentWalletId
    ? supportedWallets.find((wallet) => wallet.id === currentWalletId)
    : walletConnectWallet({ chains, projectId: getEvmProjectId() })

  return wallet
    ? wallet
    : walletConnectWallet({ chains, projectId: getEvmProjectId() })
}

export const getConnector = () => {
  const { chains } = getConfiguredChains()

  const wallet = getWallet(chains)

  return wallet.createConnector()
}

type OpenWalletProps = {
  connector: RainbowKitConnector<Connector<any, any>>
}

export const openMobileWallet = async ({ connector }: OpenWalletProps) => {
  const getUri = connector.mobile?.getUri
  if (getUri) {
    const mobileUri = await getUri()
    if (mobileUri.startsWith('http')) {
      const link = document.createElement('a')
      link.href = mobileUri
      link.target = '_blank'
      link.rel = 'noreferrer noopener'
      link.click()
    } else {
      window.location.href = mobileUri
    }
  }
}

export const tryParseDecimals = (decimals?: any) =>
  decimals ? parseInt(decimals.toString()) : undefined
