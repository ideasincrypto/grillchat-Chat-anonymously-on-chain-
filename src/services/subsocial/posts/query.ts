import { poolQuery } from '@/subsocial-query'
import {
  createSubsocialQuery,
  SubsocialQueryData,
} from '@/subsocial-query/subsocial/query'

const getPostIdsBySpaceId = poolQuery<
  SubsocialQueryData<string>,
  { spaceId: string; postIds: string[] }
>({
  multiCall: async (allParams) => {
    if (allParams.length === 0) return []
    const [{ api }] = allParams
    const spaceIds = allParams.map(({ data }) => data).filter((id) => !!id)
    if (spaceIds.length === 0) return []

    const res = await Promise.all(
      spaceIds.map((spaceId) => api.blockchain.postIdsBySpaceId(spaceId))
    )
    return res.map((postIds, i) => ({
      spaceId: spaceIds[i],
      postIds,
    }))
  },
  resultMapper: {
    paramToKey: (param) => param.data,
    resultToKey: (result) => result?.spaceId ?? '',
  },
})
export const getPostIdsBySpaceIdQuery = createSubsocialQuery({
  key: 'getPostIdsBySpaceId',
  fetcher: getPostIdsBySpaceId,
})

async function getFollowedPostIdsByAddress({
  api,
  data: address,
}: SubsocialQueryData<string>) {
  if (!address) return []

  const substrateApi = await api.substrateApi
  const rawFollowedPosts =
    await substrateApi.query.postFollows.postsFollowedByAccount(address)
  const followedPostIds = rawFollowedPosts.toPrimitive() as number[]
  return followedPostIds.map((id) => id.toString())
}
export const getFollowedPostIdsByAddressQuery = createSubsocialQuery({
  key: 'getFollowedPostIdsByAddress',
  fetcher: getFollowedPostIdsByAddress,
})
