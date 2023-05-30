import DefaultLayout from '@/components/layouts/DefaultLayout'
import { getChannelPageLink } from '@/utils/links'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import urlJoin from 'url-join'

export default function MessageRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    router.replace(
      urlJoin(
        getChannelPageLink(router),
        `?messageId=${router.query.messageId}`
      )
    )
  }, [router])

  return <DefaultLayout />
}
