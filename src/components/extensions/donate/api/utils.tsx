import { getConfiguredChains } from '@/providers/utils'
import { LocalStorage } from '@/utils/storage'
import { InstructionStepName } from '@rainbow-me/rainbowkit/dist/wallets/Wallet'
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets'
import { Connector } from 'wagmi'

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

export const openMobileWallet = async () => {
  const { chains } = getConfiguredChains()
  const connector = injectedWallet({
    chains,
  }).createConnector()

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
