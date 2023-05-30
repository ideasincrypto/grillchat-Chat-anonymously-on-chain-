import { getHubIdFromAlias } from '@/constants/chat'
import { useCreateDiscussion } from '@/services/api/mutations'
import { getChatPageLink, getUrlQuery } from '@/utils/links'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ChannelPage, { ChannelPageProps } from './ChannelPage'

export default function StubChannelPage() {
  const { mutateAsync: createDiscussion } = useCreateDiscussion()
  const [metadata, setMetadata] = useState<ChannelPageProps['stubMetadata']>({
    body: '',
    image: '',
    title: '',
  })

  const router = useRouter()

  useEffect(() => {
    async function handleDiscussion() {
      const spaceIdOrAlias = router.query.spaceId as string
      if (!router.isReady || !spaceIdOrAlias) return

      const spaceId = getHubIdFromAlias(spaceIdOrAlias) || spaceIdOrAlias

      const metadata = decodeURIComponent(getUrlQuery('metadata'))
      const resourceId = router.query.resourceId as string

      const parsedMetadata = metadata ? JSON.parse(metadata) : undefined
      if (!parsedMetadata || !resourceId) {
        router.replace('/')
        return
      }

      setMetadata(parsedMetadata)

      const { data } = await createDiscussion({
        spaceId,
        content: parsedMetadata,
        resourceId,
      })
      if (!data?.postId) {
        router.replace('/')
        return
      }

      router.replace(getChatPageLink(router, data?.postId))
    }

    handleDiscussion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  return <ChannelPage hubId='' stubMetadata={metadata} />
}
