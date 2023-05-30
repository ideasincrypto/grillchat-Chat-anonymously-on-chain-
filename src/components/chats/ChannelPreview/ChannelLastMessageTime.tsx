import { getTimeRelativeToNow } from '@/utils/date'
import { ComponentProps } from 'react'
import useLastMessage from './hooks/useLastMessage'

export type ChannelLastMessageTimeProps = ComponentProps<'div'> & {
  chatId: string
}

export default function ChannelLastMessageTime({
  chatId,
  ...props
}: ChannelLastMessageTimeProps) {
  const { data: lastMessage } = useLastMessage(chatId)
  const time = lastMessage?.struct.createdAtTime
  if (!time) return null

  return <span {...props}>{getTimeRelativeToNow(time)}</span>
}
