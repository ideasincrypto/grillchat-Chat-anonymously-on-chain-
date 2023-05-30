import { getAliasFromHubId } from '@/constants/chat'
import useIsInIframe from '@/hooks/useIsInIframe'
import { useSendEvent } from '@/stores/analytics'
import { getIpfsContentUrl } from '@/utils/ipfs'
import { getChatPageLink } from '@/utils/links'
import { createSlug } from '@/utils/slug'
import { PostData } from '@subsocial/api/types'
import { useRouter } from 'next/router'
import { ComponentProps } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import ChannelPreview from './ChannelPreview/ChannelPreview'

export type ChannelPreviewListProps = ComponentProps<'div'> & {
  chats: (PostData | undefined | null)[]
  focusedElementIndex?: number
}

export default function ChannelPreviewList({
  chats,
  focusedElementIndex,
}: ChannelPreviewListProps) {
  return (
    <div className='flex flex-col'>
      {chats.map((chat, idx) => {
        if (!chat) return null
        return (
          <ChatPreviewContainer
            isFocused={idx === focusedElementIndex}
            chat={chat}
            key={chat.id}
          />
        )
      })}
    </div>
  )
}

function ChatPreviewContainer({
  chat,
  isFocused,
}: {
  chat: PostData
  isFocused?: boolean
}) {
  const sendEvent = useSendEvent()
  const isInIframe = useIsInIframe()
  const router = useRouter()

  const content = chat?.content

  const hubId = chat.struct.spaceId
  const aliasOrHub = getAliasFromHubId(hubId ?? '') ?? hubId
  const linkTo = getChatPageLink(
    router,
    createSlug(chat.id, { title: content?.title }),
    aliasOrHub
  )

  useHotkeys(
    'enter',
    () => {
      const method = isInIframe ? 'replace' : 'push'
      router[method](linkTo)
    },
    {
      enabled: isFocused,
      preventDefault: true,
      enableOnFormTags: ['INPUT'],
      keydown: true,
    }
  )

  const onChatClick = () => {
    sendEvent(`click on chat`, {
      title: content?.title ?? '',
      chatId: chat.id,
    })
  }

  return (
    <ChannelPreview
      onClick={onChatClick}
      asContainer
      asLink={{
        replace: isInIframe,
        href: linkTo,
      }}
      image={content?.image ? getIpfsContentUrl(content.image) : ''}
      title={content?.title ?? ''}
      description={content?.body ?? ''}
      chatId={chat.id}
      hubId={hubId}
      withUnreadCount
      withFocusedStyle={isFocused}
    />
  )
}
