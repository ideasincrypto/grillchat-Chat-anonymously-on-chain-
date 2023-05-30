import ChannelPreviewList from '@/components/chats/ChannelPreviewList'
import NoChannelsFound from '@/components/chats/NoChannelsFound'
import useSortedChats from '../hooks/useSortedChats'
import { CommonHubContentProps } from './HubsPage'

export type HotChatsContentProps = CommonHubContentProps & {
  hubId: string
}

export default function HotChatsContent({
  getSearchResults,
  hubId,
}: HotChatsContentProps) {
  const { chats } = useSortedChats(hubId)

  const { searchResults, focusedElementIndex } = getSearchResults(chats, [
    'content.title',
  ])

  if (searchResults.length === 0) {
    return <NoChannelsFound search='' hubId={hubId} />
  }

  return (
    <ChannelPreviewList
      chats={searchResults}
      focusedElementIndex={focusedElementIndex}
    />
  )
}
