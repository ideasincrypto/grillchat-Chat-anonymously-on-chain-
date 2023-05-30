import { getHubIdFromAlias } from '@/constants/chat'
import ChannelListPage, {
  ChannelListPageProps,
} from '@/modules/chat/ChannelListPage'
import { prefetchChannelPreviewsData } from '@/server/chats'
import { getMainSpaceId } from '@/utils/env/client'
import { getCommonStaticProps } from '@/utils/page'
import { validateNumber } from '@/utils/strings'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { AppCommonProps } from '../_app'

export const getStaticPaths = async () => {
  // Skip pre-rendering, because it will cause slow build time
  return {
    paths: [],
    fallback: 'blocking',
  }
}

function getSpaceIdFromParam(paramSpaceId: string) {
  const spaceIdOrAlias = paramSpaceId ?? getMainSpaceId()
  let spaceId = spaceIdOrAlias
  if (!validateNumber(spaceIdOrAlias)) {
    const spaceIdFromAlias = getHubIdFromAlias(spaceIdOrAlias)
    if (spaceIdFromAlias) {
      spaceId = spaceIdFromAlias
    } else {
      return undefined
    }
  }
  return spaceId
}

export const getStaticProps = getCommonStaticProps<
  ChannelListPageProps & AppCommonProps
>(
  () => ({}),
  async (context) => {
    const queryClient = new QueryClient()

    let { spaceId: paramSpaceId } = context.params ?? {}
    const spaceId = getSpaceIdFromParam(paramSpaceId as string)
    if (!spaceId) return undefined

    try {
      await prefetchChannelPreviewsData(queryClient, spaceId)
    } catch (e) {
      console.error('Error fetching for home page: ', e)
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        hubId: spaceId,
      },
      revalidate: 2,
    }
  }
)
export default ChannelListPage
