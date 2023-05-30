import { getAliasFromHubId } from '@/constants/chat'
import useIsInIframe from '@/hooks/useIsInIframe'
import { useSendEvent } from '@/stores/analytics'
import { getIpfsContentUrl } from '@/utils/ipfs'
import { getChannelPageLink } from '@/utils/links'
import { createSlug } from '@/utils/slug'
import { PostData } from '@subsocial/api/types'
import { useRouter } from 'next/router'
import { ComponentProps } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import ChannelPreview from './ChannelPreview/ChannelPreview'

export type ChannelPreviewListProps = ComponentProps<'div'> & {
  channels: (PostData | undefined | null)[]
  focusedElementIndex?: number
}

export default function ChannelPreviewList({
  channels,
  focusedElementIndex,
}: ChannelPreviewListProps) {
  return (
    <div className='flex flex-col'>
      {channels.map((chat, idx) => {
        if (!chat) return null
        return (
          <ChannelPreviewContainer
            isFocused={idx === focusedElementIndex}
            channel={chat}
            key={chat.id}
          />
        )
      })}
    </div>
  )
}

function ChannelPreviewContainer({
  channel,
  isFocused,
}: {
  channel: PostData
  isFocused?: boolean
}) {
  const sendEvent = useSendEvent()
  const isInIframe = useIsInIframe()
  const router = useRouter()

  const content = channel?.content

  const hubId = channel.struct.spaceId
  const aliasOrHub = getAliasFromHubId(hubId ?? '') ?? hubId
  const linkTo = getChannelPageLink(
    router,
    createSlug(channel.id, { title: content?.title }),
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
      chatId: channel.id,
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
      chatId={channel.id}
      hubId={hubId}
      withUnreadCount
      withFocusedStyle={isFocused}
    />
  )
}
