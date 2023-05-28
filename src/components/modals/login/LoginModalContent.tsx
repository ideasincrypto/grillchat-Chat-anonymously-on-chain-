import LinkedEvmAddressImage from '@/assets/graphics/linked-evm-address.png'
import CreateAccountIcon from '@/assets/icons/create-account.svg'
import KeyIcon from '@/assets/icons/key.svg'
import WalletIcon from '@/assets/icons/wallet.svg'
import Button from '@/components/Button'
import TextArea from '@/components/inputs/TextArea'
import Logo from '@/components/Logo'
import { ModalFunctionalityProps } from '@/components/modals/Modal'
import ProfilePreview from '@/components/ProfilePreview'
import useGetTheme from '@/hooks/useGetTheme'
import useLoginAndRequestToken from '@/hooks/useLoginAndRequestToken'
import useToastError from '@/hooks/useToastError'
import { ApiRequestTokenResponse } from '@/pages/api/request-token'
import { useMyAccount } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import Image from 'next/image'
import {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useRef,
  useState,
} from 'react'
import { CustomConnectButton } from './CustomConnectButton'
import { useSignMessageAndLinkEvmAddress } from './utils'

export type LoginModalStep =
  | 'login'
  | 'enter-secret-key'
  | 'account-created'
  | 'evm-address-linked'
  | 'evm-connecting-error'

type ContentProps = ModalFunctionalityProps & {
  setCurrentStep: Dispatch<SetStateAction<LoginModalStep>>
  currentStep: LoginModalStep
  onSubmit: (e: SyntheticEvent) => Promise<void>
  openModal: () => void
  runCaptcha: () => Promise<string | null>
  termsAndService: (className?: string) => JSX.Element
}

export const LoginContent = ({
  setCurrentStep,
  runCaptcha,
  termsAndService,
}: ContentProps) => {
  const [hasStartCaptcha, setHasStartCaptcha] = useState(false)

  const {
    mutateAsync: loginAndRequestToken,
    isLoading: loadingRequestToken,
    error,
  } = useLoginAndRequestToken()
  useToastError<ApiRequestTokenResponse>(
    error,
    'Create account failed',
    (e) => e.message
  )

  const isLoading = loadingRequestToken || hasStartCaptcha

  return (
    <div>
      <div className='flex w-full flex-col justify-center'>
        <Logo className='mb-8 text-5xl' />
        <div className='flex flex-col gap-4'>
          <Button onClick={() => setCurrentStep('enter-secret-key')} size='lg'>
            <div className='flex items-center justify-center gap-2'>
              <KeyIcon />
              Enter Grill secret key
            </div>
          </Button>
          <Button
            type='button'
            variant='primaryOutline'
            size='lg'
            className='w-full'
            isLoading={isLoading}
            onClick={async () => {
              setHasStartCaptcha(true)
              const token = await runCaptcha()
              if (!token) return
              setHasStartCaptcha(false)
              const newAddress = await loginAndRequestToken({
                captchaToken: token,
              })
              if (newAddress) {
                setCurrentStep('account-created')
              }
              // props.closeModal()
            }}
          >
            <div className='flex items-center justify-center gap-2'>
              <CreateAccountIcon />
              Create an account
            </div>
          </Button>

          {termsAndService('mt-4')}
        </div>
      </div>
    </div>
  )
}

export const EnterSecretKeyContent = ({ onSubmit }: ContentProps) => {
  const [privateKey, setPrivateKey] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  return (
    <form onSubmit={onSubmit} className='mt-2 flex flex-col gap-4'>
      <TextArea
        ref={inputRef}
        value={privateKey}
        rows={3}
        size='sm'
        autoFocus
        className='bg-background'
        onChange={(e) => setPrivateKey((e.target as HTMLTextAreaElement).value)}
        placeholder='Enter your Grill secret key'
      />
      <Button disabled={!privateKey} size='lg'>
        Login
      </Button>
    </form>
  )
}

export const AccountCreatedContent = ({ setCurrentStep }: ContentProps) => {
  const theme = useGetTheme()
  const address = useMyAccount((state) => state.address)

  const { signAndLinkEvmAddress, isSigningMessage } =
    useSignMessageAndLinkEvmAddress({
      setModalStep: () => setCurrentStep('evm-address-linked'),
      onError: () => setCurrentStep('evm-connecting-error'),
    })

  const isDarkTheme = theme === 'dark'

  return (
    <div className='flex flex-col'>
      {address && (
        <div
          className={cx(
            'mt-2 mb-6 rounded-2xl p-4',
            isDarkTheme ? 'bg-slate-700' : 'bg-slate-200'
          )}
        >
          <ProfilePreview address={address} />
        </div>
      )}
      <div className='flex items-center'>
        <div className='w-full border-b border-background-lightest'></div>
        <p className='min-w-fit px-4 text-text-muted'>WHAT’S NEXT?</p>
        <div className='w-full border-b border-background-lightest'></div>
      </div>
      <p className='mb-4 mt-6 text-text-muted'>
        Now, you can connect an EVM wallet to benefit from EVM features such as
        ERC20 tokens, NFTs, and more.
      </p>
      <CustomConnectButton
        className='w-full'
        signAndLinkEvmAddress={signAndLinkEvmAddress}
        isSigningMessage={isSigningMessage}
        label={
          <div className='flex items-center justify-center gap-2'>
            <WalletIcon />
            Connect Wallet
          </div>
        }
      />
    </div>
  )
}

export const EvmAddressLinked = ({ closeModal }: ContentProps) => (
  <div className='flex flex-col items-center gap-6'>
    <Image src={LinkedEvmAddressImage} alt='' className='w-full max-w-sm' />
    <Button size={'lg'} onClick={() => closeModal()} className='w-full'>
      Got it!
    </Button>
  </div>
)

export const EvmLoginError = ({ setCurrentStep }: ContentProps) => {
  const { signAndLinkEvmAddress, isSigningMessage } =
    useSignMessageAndLinkEvmAddress({
      setModalStep: () => setCurrentStep('evm-address-linked'),
    })

  return (
    <CustomConnectButton
      isSigningMessage={isSigningMessage}
      signAndLinkOnConnect={false}
      signAndLinkEvmAddress={signAndLinkEvmAddress}
      className='w-full'
      label='Try again'
    />
  )
}

type LoginModalContents = {
  [key in LoginModalStep]: (props: ContentProps) => JSX.Element
}

export const loginModalContents: LoginModalContents = {
  login: LoginContent,
  'enter-secret-key': EnterSecretKeyContent,
  'account-created': AccountCreatedContent,
  'evm-address-linked': EvmAddressLinked,
  'evm-connecting-error': EvmLoginError,
}
