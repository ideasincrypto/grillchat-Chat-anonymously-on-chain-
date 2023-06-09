import ImageLoader from '@/components/ImageLoader'
import Name from '@/components/Name'
import useRandomColor from '@/hooks/useRandomColor'
import { getPostQuery } from '@/services/api/query'
import { getNftDataQuery } from '@/services/external/query'
import { cx } from '@/utils/class-names'
import { truncateText } from '@/utils/strings'
import { useTheme } from 'next-themes'
import { ComponentProps, useState } from 'react'

export type RepliedMessagePreviewProps = ComponentProps<'div'> & {
  repliedMessageId: string
  originalMessage: string
  minimumReplyChar?: number
  scrollToMessage?: (messageId: string) => Promise<void>
  replyToExtension?: boolean
}

const MINIMUM_REPLY_CHAR = 35
export default function RepliedMessagePreview({
  repliedMessageId,
  originalMessage,
  scrollToMessage,
  minimumReplyChar = MINIMUM_REPLY_CHAR,
  replyToExtension = false,
  ...props
}: RepliedMessagePreviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: message } = getPostQuery.useQuery(repliedMessageId)
  const replySender = message?.struct.ownerId
  const replySenderColor = useRandomColor(replySender)
  const { theme } = useTheme()

  // TODO: extract to better flexibility for other extensions
  const extensions = message?.content?.extensions
  const firstExtension = extensions?.[0]
  const hasNftExtension =
    firstExtension && firstExtension.id === 'subsocial-evm-nft'

  const messageContent =
    message?.content?.body || (hasNftExtension ? 'NFT' : '')

  const { data: nftData } = getNftDataQuery.useQuery(
    firstExtension?.properties ?? null
  )

  if (!message) {
    return null
  }

  let showedText = messageContent ?? ''
  const { id, properties } = message.content?.extensions?.[0] || {}

  if (originalMessage.length < minimumReplyChar) {
    showedText = truncateText(showedText, minimumReplyChar)
  }

  const onRepliedMessageClick = async () => {
    if (!scrollToMessage) return
    setIsLoading(true)
    await scrollToMessage(repliedMessageId)
    setIsLoading(false)
  }

  const { amount, token } = properties || {}

  const donateRepliedPreview =
    id === 'subsocial-donations' ? (
      <div
        className={cx(
          'bg-gradient-to-br from-[#C43333] to-[#F9A11E]',
          'rounded-2xl px-3 py-[0.15rem] text-white'
        )}
      >
        {amount} {token}
      </div>
    ) : null

  return (
    <div
      {...props}
      className={cx(
        'flex gap-2 overflow-hidden border-l-2 pl-2 text-sm',
        scrollToMessage && 'cursor-pointer',
        isLoading && 'animate-pulse',
        props.className
      )}
      style={{ borderColor: replySenderColor, ...props.style }}
      onClick={(e) => {
        e.stopPropagation()
        onRepliedMessageClick()
        props.onClick?.(e)
      }}
    >
      {hasNftExtension && (
        <ImageLoader
          containerClassName={cx('rounded-md overflow-hidden flex-shrink-0')}
          className={cx('aspect-square w-10')}
          placeholderClassName={cx('w-10 aspect-square')}
          image={nftData?.image}
        />
      )}
      <div className='flex flex-1 flex-col'>
        <Name ownerId={message?.struct.ownerId} className='font-medium' />
        <div
          className={cx('flex items-center gap-2', {
            ['text-white']: theme === 'light' && replyToExtension,
          })}
        >
          <span
            className={cx(
              'overflow-hidden overflow-ellipsis whitespace-nowrap opacity-75',
              {
                ['text-white']: theme === 'light' && replyToExtension,
              }
            )}
          >
            {showedText}
          </span>
        </div>
      </div>
    </div>
  )
}
