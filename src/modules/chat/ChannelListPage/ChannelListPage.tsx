import ChannelPreviewList from '@/components/chats/ChannelPreviewList'
import NoChannelsFound from '@/components/chats/NoChannelsFound'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import useIsInIframe from '@/hooks/useIsInIframe'
import useSearch from '@/hooks/useSearch'
import dynamic from 'next/dynamic'
import useSortedChats from '../hooks/useSortedChats'
import ChannelListPageNavbar from './ChannelListPageNavbar'

const WelcomeModal = dynamic(() => import('@/components/modals/WelcomeModal'), {
  ssr: false,
})

export type ChannelListPageProps = {
  hubId: string
}
const searchKeys = ['content.title']
export default function ChannelListPage({ hubId }: ChannelListPageProps) {
  const isInIframe = useIsInIframe()

  const { chats, allChatIds } = useSortedChats(hubId)

  const { search, getSearchResults, setSearch, focusController } = useSearch()
  const { focusedElementIndex, searchResults } = getSearchResults(
    chats,
    searchKeys
  )

  return (
    <DefaultLayout
      navbarProps={{
        backButtonProps: {
          defaultBackLink: '/hubs',
          forceUseDefaultBackLink: true,
        },
        customContent: ({
          backButton,
          logoLink,
          authComponent,
          colorModeToggler,
        }) => {
          return (
            <ChannelListPageNavbar
              chatsCount={allChatIds.length}
              auth={authComponent}
              colorModeToggler={colorModeToggler}
              backButton={backButton}
              logo={logoLink}
              spaceId={hubId}
              searchProps={{
                search,
                setSearch,
                ...focusController,
              }}
            />
          )
        },
      }}
    >
      {!isInIframe && <WelcomeModal />}
      <div className='flex flex-col'>
        {searchResults.length === 0 && (
          <NoChannelsFound search={search} hubId={hubId} />
        )}
        <ChannelPreviewList
          chats={searchResults}
          focusedElementIndex={focusedElementIndex}
        />
      </div>
    </DefaultLayout>
  )
}
