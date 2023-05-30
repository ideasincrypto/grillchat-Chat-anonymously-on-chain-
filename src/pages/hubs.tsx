import { getLinkedChannelIdsForHubId } from '@/constants/chat'
import HubsPage from '@/modules/chat/HubsPage'
import { HubsPageProps } from '@/modules/chat/HubsPage/HubsPage'
import { AppCommonProps } from '@/pages/_app'
import { prefetchChannelPreviewsData } from '@/server/chats'
import { getSpaceQuery } from '@/services/subsocial/spaces'
import { getSubsocialApi } from '@/subsocial-query/subsocial/connection'
import { getMainSpaceId, getSpaceIds } from '@/utils/env/client'
import { getCommonStaticProps } from '@/utils/page'
import { dehydrate, QueryClient } from '@tanstack/react-query'

export const getStaticProps = getCommonStaticProps<
  HubsPageProps & AppCommonProps
>(
  () => ({}),
  async () => {
    const hubsChatCount: HubsPageProps['hubsChatCount'] = {}
    const hubIds = getSpaceIds()

    const queryClient = new QueryClient()

    try {
      const subsocialApi = await getSubsocialApi()
      const hubsData = await subsocialApi.findSpaces({
        ids: hubIds,
        visibility: 'onlyVisible',
      })

      await Promise.all([
        prefetchChannelPreviewsData(queryClient, getMainSpaceId()),
        ...hubsData.map(async (hub) => {
          const chatIds = await subsocialApi.blockchain.postIdsBySpaceId(hub.id)
          const linkedChats = getLinkedChannelIdsForHubId(hub.id)
          hubsChatCount[hub.id] = chatIds.length + linkedChats.length
        }),
      ])

      hubsData.forEach((hub) => {
        getSpaceQuery.setQueryData(queryClient, hub.id, hub)
      })
    } catch (err) {
      console.error('Error fetching for hubs page: ', err)
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        hubsChatCount,
        isIntegrateChatButtonOnTop: Math.random() > 0.5,
      },
    }
  }
)
export default HubsPage
