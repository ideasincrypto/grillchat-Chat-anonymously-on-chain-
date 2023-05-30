import DefaultLayout from '@/components/layouts/DefaultLayout'
import { isEmptyObject } from '@/utils/general'
import { getChannelPageLink } from '@/utils/links'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import urlJoin from 'url-join'

export default function AboutChannelRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady || isEmptyObject(router.query)) return
    router.replace(urlJoin(getChannelPageLink(router), '?open=about'))
  }, [router])

  return <DefaultLayout />
}
