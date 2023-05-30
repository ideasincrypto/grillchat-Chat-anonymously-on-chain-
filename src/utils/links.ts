import { ParsedUrlQuery } from 'querystring'

export function getUrlQuery(queryName: string) {
  const query = window.location.search
  const searchParams = new URLSearchParams(query)
  return searchParams.get(queryName) ?? ''
}

export function getCurrentUrlOrigin() {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

export function getCurrentUrlWithoutQuery() {
  return window.location.origin + window.location.pathname
}

type CurrentPath = { query: ParsedUrlQuery }
function getHubIdFromUrl(currentPath: CurrentPath) {
  return currentPath.query.spaceId as string
}

export function getHubChannelListPageLink(currentPath: CurrentPath) {
  const spaceId = getHubIdFromUrl(currentPath)
  return `/${spaceId ?? ''}`
}

export function getChannelPageLink(
  currentPath: CurrentPath,
  channelSlug?: string,
  defaultHubId?: string
) {
  const hubId = getHubIdFromUrl(currentPath) ?? defaultHubId
  const currentSlug = currentPath.query.slug
  if (!channelSlug && typeof currentSlug === 'string') {
    channelSlug = currentSlug
  }
  return `/${hubId}/${channelSlug}`
}
