import { getLinkedChatIdsForSpaceId } from '@/constants/chat-room'
import { getPostQuery } from '@/services/api/query'
import { getPostIdsBySpaceIdQuery } from '@/services/subsocial/posts'
import { useMemo } from 'react'
import useSortChatIdsByConfig from './useSortChatIdsByConfig'
import useSortChatIdsByLatestMessage from './useSortChatIdsByLatestMessage'

export default function useSortedChats(hubId: string) {
  const { data } = getPostIdsBySpaceIdQuery.useQuery(hubId)
  const allChatIds = useMemo(() => {
    return [...(data?.postIds ?? []), ...getLinkedChatIdsForSpaceId(hubId)]
  }, [data, hubId])

  const sortedIds = useSortChatIdsByLatestMessage(allChatIds)
  const order = useSortChatIdsByConfig(sortedIds)

  const chatQueries = getPostQuery.useQueries(order)
  const chats = useMemo(
    () => chatQueries.map(({ data }) => data),
    [chatQueries]
  )

  return { chats, allChatIds }
}
