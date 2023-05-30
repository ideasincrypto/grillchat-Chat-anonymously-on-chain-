import { cx } from '@/utils/class-names'
import { ComponentProps } from 'react'

export type MessageListTopNoticeProps = ComponentProps<'div'>

export default function MessageListTopNotice({
  ...props
}: MessageListTopNoticeProps) {
  return (
    <div {...props} className={cx('flex justify-center', props.className)}>
      <span className='text-sm text-text-muted'>
        You have reached the first message in this topic!
      </span>
    </div>
  )
}
