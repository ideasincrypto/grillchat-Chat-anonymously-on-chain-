export const MESSAGES_PER_PAGE = 50

const ALIAS_TO_HUB_ID_MAP: Record<string, string> = {
  x: '1002',
  polka: '1005',
  // nft: '1009',
  polkassembly: '1010',
  events: '1011',
  'polkadot-study': '1014',
  zeitgeist: '1015',
}
const HUB_ID_TO_ALIAS_MAP = Object.entries(ALIAS_TO_HUB_ID_MAP).reduce(
  (acc, [alias, spaceId]) => {
    acc[spaceId] = alias
    return acc
  },
  {} as Record<string, string>
)
export function getAliasFromHubId(spaceId: string) {
  return HUB_ID_TO_ALIAS_MAP[spaceId] ?? ''
}
export function getHubIdFromAlias(alias: string) {
  return ALIAS_TO_HUB_ID_MAP[alias] ?? ''
}

const LINKED_CHANNEL_IDS_IN_HUB_ID: Record<string, string[]> = {
  '1005': ['754', '2808', '2052'],
  '1002': ['3477', '3454'],
}
export function getLinkedChannelIdsForHubId(hubId: string) {
  return LINKED_CHANNEL_IDS_IN_HUB_ID[hubId] ?? []
}
