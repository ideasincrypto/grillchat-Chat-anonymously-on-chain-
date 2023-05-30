import Button from '@/components/Button'
import Container from '@/components/Container'
import useIsJoinedToChat from '@/hooks/useIsJoinedToChat'
import { FollowPostWrapper } from '@/services/subsocial/posts/mutation'
import { cx } from '@/utils/class-names'
import dynamic from 'next/dynamic'
import { ComponentProps, useRef, useState } from 'react'
import ChannelForm from './ChannelForm'

const MessageList = dynamic(() => import('../MessageList'), {
  ssr: false,
})
const RepliedMessage = dynamic(() => import('./RepliedMessage'), {
  ssr: false,
})

export type ChannelProps = ComponentProps<'div'> & {
  asContainer?: boolean
  scrollableContainerClassName?: string
  chatId: string
  hubId: string
}

export default function Channel({
  className,
  asContainer,
  scrollableContainerClassName,
  chatId,
  hubId,
  ...props
}: ChannelProps) {
  const [replyTo, setReplyTo] = useState<string | undefined>(undefined)

  const Component = asContainer ? Container<'div'> : 'div'
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer?.scrollTo({
        top: scrollContainer?.scrollHeight,
        behavior: 'auto',
      })
    }
  }

  const closeReply = () => setReplyTo(undefined)

  const { isJoined, isLoading: isLoadingJoinedChat } = useIsJoinedToChat(chatId)

  return (
    <div {...props} className={cx('flex flex-col', className)}>
      <MessageList
        hubId={hubId}
        newMessageNoticeClassName={cx(replyTo && 'bottom-2')}
        chatId={chatId}
        asContainer={asContainer}
        scrollableContainerClassName={scrollableContainerClassName}
        scrollContainerRef={scrollContainerRef}
        onSelectMessageAsReply={setReplyTo}
        replyTo={replyTo}
      />
      <Component
        className={cx('mt-auto flex flex-col py-3', replyTo && 'pt-0')}
      >
        {replyTo && (
          <RepliedMessage
            closeReply={closeReply}
            replyMessageId={replyTo}
            scrollContainer={scrollContainerRef}
          />
        )}
        {isJoined ? (
          <ChannelForm
            replyTo={replyTo}
            onSubmit={scrollToBottom}
            chatId={chatId}
            clearReplyTo={closeReply}
          />
        ) : (
          <FollowPostWrapper>
            {({ isLoading, mutateAsync }) => (
              <Button
                size='lg'
                isLoading={isLoading || isLoadingJoinedChat}
                onClick={() => mutateAsync({ chatId })}
              >
                Join
              </Button>
            )}
          </FollowPostWrapper>
        )}
      </Component>
    </div>
  )
}
