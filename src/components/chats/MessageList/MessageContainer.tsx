import useIsMessageBlocked from '@/hooks/useIsMessageBlocked'
import { useMyAccount } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { ComponentProps } from 'react'
import Message, { MessageProps } from '../Message'

export type MessageContainerProps = Omit<MessageProps, 'isMyMessage'> & {
  containerProps?: ComponentProps<'div'>
  chatId: string
  hubId: string
}

export default function MessageContainer({
  containerProps,
  chatId,
  hubId,
  ...props
}: MessageContainerProps) {
  const { message } = props

  const isMessageBlocked = useIsMessageBlocked(hubId, message, chatId)
  const address = useMyAccount((state) => state.address)
  if (!message?.content?.body || isMessageBlocked) return null

  const ownerId = message.struct.ownerId
  const senderAddress = ownerId ?? ''

  const isMyMessage = address === senderAddress

  return (
    <div
      {...containerProps}
      className={cx(
        'w-11/12 md:w-10/12',
        isMyMessage && 'self-end',
        containerProps?.className
      )}
    >
      <Message {...props} isMyMessage={isMyMessage} />
    </div>
  )
}
