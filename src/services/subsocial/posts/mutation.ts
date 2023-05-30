import useWaitHasEnergy from '@/hooks/useWaitHasEnergy'
import { MutationConfig } from '@/subsocial-query'
import { useSubsocialMutation } from '@/subsocial-query/subsocial/mutation'
import { useQueryClient } from '@tanstack/react-query'
import { useWalletGetter } from '../hooks'
import { createMutationWrapper } from '../utils'
import { getFollowedPostIdsByAddressQuery } from './query'

export type FollowPostParams = {
  chatId: string
}
export function useFollowPost(config?: MutationConfig<FollowPostParams>) {
  const client = useQueryClient()
  const getWallet = useWalletGetter()

  const waitHasEnergy = useWaitHasEnergy()

  return useSubsocialMutation<FollowPostParams, null>(
    getWallet,
    async ({ chatId }, { substrateApi }) => {
      console.log('waiting energy...')
      await waitHasEnergy()

      return {
        tx: substrateApi.tx.postFollows.followPost(chatId),
        summary: 'Following post',
      }
    },
    config,
    {
      txCallbacks: {
        getContext: () => null,
        onSend: ({ address, data }) => {
          getFollowedPostIdsByAddressQuery.setQueryData(
            client,
            address,
            (ids) => [...(ids ?? []), data.chatId]
          )
        },
        onError: ({ address }) => {
          getFollowedPostIdsByAddressQuery.invalidate(client, address)
        },
        onSuccess: ({ address }) => {
          getFollowedPostIdsByAddressQuery.invalidate(client, address)
        },
      },
    }
  )
}
export const FollowPostWrapper = createMutationWrapper(
  useFollowPost,
  'Failed to join chat'
)

export type UnfollowPostParams = {
  chatId: string
}
export function useUnfollowPost(config?: MutationConfig<UnfollowPostParams>) {
  const client = useQueryClient()
  const getWallet = useWalletGetter()

  const waitHasEnergy = useWaitHasEnergy()

  return useSubsocialMutation<FollowPostParams, null>(
    getWallet,
    async ({ chatId }, { substrateApi }) => {
      console.log('waiting energy...')
      await waitHasEnergy()

      return {
        tx: substrateApi.tx.postFollows.unfollowPost(chatId),
        summary: 'Unfollowing Post',
      }
    },
    config,
    {
      txCallbacks: {
        getContext: () => null,
        onSend: ({ address, data }) => {
          getFollowedPostIdsByAddressQuery.setQueryData(
            client,
            address,
            (ids) => ids?.filter((id) => id !== data.chatId)
          )
        },
        onError: ({ address }) => {
          getFollowedPostIdsByAddressQuery.invalidate(client, address)
        },
        onSuccess: ({ address }) => {
          getFollowedPostIdsByAddressQuery.invalidate(client, address)
        },
      },
    }
  )
}
export const UnfollowPostWrapper = createMutationWrapper(
  useUnfollowPost,
  'Failed to leave chat'
)
