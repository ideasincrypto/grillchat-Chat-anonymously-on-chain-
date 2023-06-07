/**
 * This MediaRenderer is from @thirdweb-dev/react package
 * https://github.com/thirdweb-dev/react/tree/main
 * All the utilities are put together to this file.
 */

/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/display-name */
import { useQuery } from '@tanstack/react-query'
import mime from 'mime/lite.js'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import useDimensions from 'react-cool-dimensions'

import { SVGProps } from 'react'

const CarbonDocumentUnknown: React.VFC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg width='1em' height='1em' viewBox='0 0 32 32' {...props}>
      <circle cx='9' cy='28.5' r='1.5' fill='currentColor'></circle>
      <path
        fill='currentColor'
        d='M10 25H8v-4h2a2 2 0 0 0 0-4H8a2.002 2.002 0 0 0-2 2v.5H4V19a4.005 4.005 0 0 1 4-4h2a4 4 0 0 1 0 8Z'
      ></path>
      <path
        fill='currentColor'
        d='m27.7 9.3l-7-7A.908.908 0 0 0 20 2H10a2.006 2.006 0 0 0-2 2v8h2V4h8v6a2.006 2.006 0 0 0 2 2h6v16H14v2h12a2.006 2.006 0 0 0 2-2V10a.91.91 0 0 0-.3-.7ZM20 10V4.4l5.6 5.6Z'
      ></path>
    </svg>
  )
}

const CarbonDocumentAudio: React.VFC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg width='1em' height='1em' viewBox='0 0 32 32' {...props}>
      <path
        fill='currentColor'
        d='M29 31a.999.999 0 0 1-.625-.22L23.65 27H20a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h3.65l4.726-3.78A1 1 0 0 1 30 17v13a1 1 0 0 1-1 1Zm-8-6h3a1 1 0 0 1 .625.22L28 27.92v-8.84l-3.376 2.7A1 1 0 0 1 24 22h-3Z'
      ></path>
      <path
        fill='currentColor'
        d='M16 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6v3h2v-5a.91.91 0 0 0-.3-.7l-7-7A.909.909 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h8Zm2-23.6l5.6 5.6H18Z'
      ></path>
    </svg>
  )
}

const CarbonPauseFilled: React.VFC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg width='1em' height='1em' viewBox='0 0 32 32' {...props}>
      <path
        fill='currentColor'
        d='M12 6h-2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm10 0h-2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z'
      ></path>
    </svg>
  )
}

const CarbonPlayFilledAlt: React.VFC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg width='1em' height='1em' viewBox='0 0 32 32' {...props}>
      <path
        fill='currentColor'
        d='M7 28a1 1 0 0 1-1-1V5a1 1 0 0 1 1.482-.876l20 11a1 1 0 0 1 0 1.752l-20 11A1 1 0 0 1 7 28Z'
      ></path>
    </svg>
  )
}

interface SharedMediaProps {
  className?: string
  style?: React.CSSProperties
  width?: HTMLIFrameElement['width']
  height?: HTMLIFrameElement['height']
  /**
   * Require user interaction to play the media. (default false)
   */
  requireInteraction?: boolean
  /**
   * Show the media controls (where applicable) (default false)
   */
  controls?: HTMLVideoElement['controls']
}

/**
 *
 * The props for the {@link MediaRenderer} component.
 * @public
 */
interface MediaRendererProps extends SharedMediaProps {
  /**
   * The media source uri.
   */
  src?: string | null
  /**
   * The alt text for the media.
   */
  alt?: string
  /**
   * The media poster image uri. (if applicable)
   */
  poster?: string | null
}

function mergeRefs<T = any>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
        // eslint-disable-next-line eqeqeq
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}

const DEFAULT_IPFS_GATEWAY = 'https://gateway.ipfscdn.io/ipfs/'

interface IPFSResolverOptions {
  gatewayUrl: string
}

const DEFAULT_IPFS_RESOLVER_OPTIONS: IPFSResolverOptions = {
  gatewayUrl: DEFAULT_IPFS_GATEWAY,
}

function resolveIpfsUri(uri?: string, options = DEFAULT_IPFS_RESOLVER_OPTIONS) {
  if (!uri) {
    return undefined
  }
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', options.gatewayUrl)
  }
  return uri
}

async function resolveMimeType(url?: string) {
  if (!url) {
    return undefined
  }
  const mimeType = mime.getType(url)
  if (mimeType) {
    return mimeType
  }

  const res = await fetch(url, {
    method: 'HEAD',
  })
  if (res.ok && res.headers.has('content-type')) {
    return res.headers.get('content-type') ?? undefined
  }
  // we failed to resolve the mime type, return null
  return undefined
}

let video: HTMLVideoElement

function supportsVideoType(mimeType?: string) {
  if (
    typeof window === 'undefined' ||
    !mimeType ||
    !mimeType.startsWith('video/')
  ) {
    return ''
  }

  if (!video) {
    video = document.createElement('video')
  }

  return video.canPlayType(mimeType)
}

function shouldRenderVideoTag(mimeType?: string) {
  return !!supportsVideoType(mimeType)
}

let audio: HTMLAudioElement

function supportsAudioType(mimeType?: string) {
  if (
    typeof window === 'undefined' ||
    !mimeType ||
    !mimeType.startsWith('audio/')
  ) {
    return ''
  }

  if (!audio) {
    audio = document.createElement('audio')
  }

  return audio.canPlayType(mimeType)
}

function shouldRenderAudioTag(mimeType?: string) {
  return !!supportsAudioType(mimeType)
}

interface PlayButtonProps {
  onClick: () => void
  isPlaying: boolean
}

const PlayButton: React.VFC<PlayButtonProps> = ({ onClick, isPlaying }) => {
  const [isHovering, setIsHovering] = useState(false)
  const onMouseEnter = () => setIsHovering(true)
  const onMouseLeave = () => setIsHovering(false)
  const onMouseDown = () => setIsHovering(false)
  const onMouseUp = () => setIsHovering(true)
  return (
    <button
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        transform: 'translate(-25%, -25%)',
        maxWidth: '32px',
        width: '8%',
        minWidth: '24px',
        aspectRatio: '1',
        zIndex: 3,
        backgroundColor: '#fff',
        color: 'rgb(138, 147, 155)',
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        border: '1px solid rgb(229, 232, 235)',
        cursor: 'pointer',
        ...(isHovering
          ? {
              color: 'rgb(53, 56, 64)',
              boxShadow: 'rgb(4 17 29 / 25%) 0px 0px 8px 0px',
            }
          : {}),
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {!isPlaying ? (
        <CarbonPlayFilledAlt style={{ width: '66%', height: '66%' }} />
      ) : (
        <CarbonPauseFilled style={{ width: '66%', height: '66%' }} />
      )}
    </button>
  )
}

const VideoPlayer = React.forwardRef<
  HTMLVideoElement,
  React.PropsWithChildren<MediaRendererProps>
>(
  (
    {
      src,
      alt,
      poster,
      requireInteraction,
      children,
      style,
      width,
      height,
      controls,
      ...restProps
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [playing, setPlaying] = useState(!requireInteraction)
    const [muted, setMuted] = useState(true)

    useEffect(() => {
      if (videoRef.current) {
        if (playing) {
          try {
            videoRef.current.play()
          } catch (err) {
            console.error('error playing video', err)
          }
        } else {
          try {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
          } catch (err) {
            console.error('error pausing video', err)
          }
        }
      }
    }, [playing])

    return (
      <div style={{ position: 'relative', ...style }} {...restProps}>
        <video
          ref={mergeRefs([videoRef, ref])}
          src={src ?? undefined}
          poster={poster ?? undefined}
          loop
          playsInline
          muted={muted}
          preload={poster ? 'metadata' : 'auto'}
          onCanPlay={() => {
            if (playing) {
              videoRef.current?.play()
            }
          }}
          width={width}
          height={height}
          controls={controls}
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'contain',
            zIndex: 1,
            transition: 'opacity .5s',
            opacity: !poster ? 1 : playing ? 1 : 0,
          }}
        />
        {poster && (
          <img
            src={poster}
            style={{
              objectFit: 'contain',
              pointerEvents: 'none',
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 2,
              transition: 'opacity .5s',
              opacity: playing ? 0 : 1,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
        <PlayButton
          onClick={() => {
            setPlaying((prev) => !prev)
            setMuted(false)
          }}
          isPlaying={playing}
        />
      </div>
    )
  }
)

const AudioPlayer = React.forwardRef<
  HTMLAudioElement,
  React.PropsWithChildren<MediaRendererProps>
>(
  (
    {
      src,
      alt,
      poster,
      requireInteraction,
      children,
      style,
      height,
      width,
      controls,
      ...restProps
    },
    ref
  ) => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [playing, setPlaying] = useState(false)
    const [muted, setMuted] = useState(true)

    useEffect(() => {
      if (audioRef.current) {
        if (playing) {
          audioRef.current.play()
        } else {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }
      }
    }, [playing])

    return (
      <div style={{ position: 'relative', ...style }} {...restProps}>
        {poster ? (
          <img
            height={height}
            width={width}
            src={poster}
            style={{
              height: '100%',
              width: '100%',
              pointerEvents: 'none',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              pointerEvents: 'none',
              backgroundColor: '#fff',
              color: 'rgb(138, 147, 155)',
            }}
          >
            <CarbonDocumentAudio style={{ height: '64px', width: '64px' }} />
          </div>
        )}

        <PlayButton
          onClick={() => {
            setPlaying((prev) => !prev)
            setMuted(false)
          }}
          isPlaying={playing}
        />
        <audio
          ref={mergeRefs([audioRef, ref])}
          src={src ?? undefined}
          loop
          playsInline
          muted={muted}
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1,
            visibility: 'hidden',
          }}
        />
      </div>
    )
  }
)

const IframePlayer = React.forwardRef<
  HTMLIFrameElement,
  React.PropsWithChildren<MediaRendererProps>
>(
  (
    {
      src,
      alt,
      poster,
      requireInteraction,
      children,
      style,
      height,
      width,
      controls,
      ...restProps
    },
    ref
  ) => {
    const { observe, width: elWidth } = useDimensions<HTMLDivElement | null>()
    const [playing, setPlaying] = useState(!requireInteraction)

    if (elWidth < 300) {
      return (
        <div ref={observe}>
          <LinkPlayer style={style} src={src} alt={alt} {...restProps} />
        </div>
      )
    }

    return (
      <div
        style={{ position: 'relative', ...style }}
        {...restProps}
        ref={observe}
      >
        <iframe
          src={playing ? src ?? undefined : undefined}
          ref={ref}
          style={{
            objectFit: 'contain',
            zIndex: 1,
            height: '100%',
            width: '100%',
            transition: 'opacity .5s',
            opacity: !poster ? 1 : playing ? 1 : 0,
          }}
        />
        {poster && (
          <img
            src={poster}
            style={{
              objectFit: 'contain',
              pointerEvents: 'none',
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 2,
              transition: 'opacity .5s',
              opacity: playing ? 0 : 1,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
        <PlayButton
          onClick={() => {
            setPlaying((prev) => !prev)
          }}
          isPlaying={playing}
        />
      </div>
    )
  }
)
const LinkPlayer = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithChildren<MediaRendererProps>
>(
  (
    {
      src,
      alt,
      poster,
      requireInteraction,
      children,
      style,
      height,
      width,
      controls,
      ...restProps
    },
    ref
  ) => {
    return (
      <div style={{ position: 'relative', ...style }} {...restProps}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            backgroundColor: '#fff',
            color: 'rgb(138, 147, 155)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'nowrap',
            }}
          >
            <CarbonDocumentUnknown
              style={{
                maxWidth: '128px',
                minWidth: '48px',
                width: '50%',
                aspectRatio: '1',
              }}
            />
            <a
              rel='noopener noreferrer'
              style={{
                textDecoration: 'underline',
                color: 'rgb(138, 147, 155)',
              }}
              href={src ?? undefined}
              target='_blank'
              ref={ref as unknown as React.LegacyRef<HTMLAnchorElement>}
            >
              {alt || 'File'}
            </a>
          </div>
        </div>
      </div>
    )
  }
)

/**
 * This component can be used to render any media type, including image, audio, video, and html files.
 * Its convenient for rendering NFT media files, as these can be a variety of different types.
 * The component falls back to a external link if the media type is not supported.
 *
 * Props: {@link MediaRendererProps}
 *
 * @example
 * We can take a video file hosted on IPFS and render it using this component as follows
 * ```jsx
 * const Component = () => {
 *   return <MediaRenderer
 *     src="ipfs://Qmb9ZV5yznE4C4YvyJe8DVFv1LSVkebdekY6HjLVaKmHZi"
 *     alt="A mp4 video"
 *   />
 * }
 * ```
 *
 * You can try switching out the `src` prop to different types of URLs and media types to explore the possibilities.
 */
const MediaRenderer = React.forwardRef<
  HTMLMediaElement,
  React.PropsWithChildren<MediaRendererProps>
>(
  (
    {
      children,
      src,
      poster,
      alt,
      requireInteraction = false,
      style,
      ...restProps
    },
    ref
  ) => {
    const mergedStyle: React.CSSProperties = { objectFit: 'contain', ...style }
    const videoOrImageSrc = useResolvedMediaType(src ?? undefined)
    const possiblePosterSrc = useResolvedMediaType(poster ?? undefined)
    if (!videoOrImageSrc.mimeType) {
      return (
        <img
          style={mergedStyle}
          {...restProps}
          ref={ref as unknown as React.LegacyRef<HTMLImageElement>}
        />
      )
    } else if (videoOrImageSrc.mimeType === 'text/html') {
      return (
        <IframePlayer
          style={mergedStyle}
          src={videoOrImageSrc.url}
          poster={possiblePosterSrc.url}
          requireInteraction={requireInteraction}
          {...restProps}
        />
      )
    } else if (shouldRenderVideoTag(videoOrImageSrc.mimeType)) {
      return (
        <VideoPlayer
          style={mergedStyle}
          src={videoOrImageSrc.url}
          poster={possiblePosterSrc.url}
          requireInteraction={requireInteraction}
          {...restProps}
        />
      )
    } else if (shouldRenderAudioTag(videoOrImageSrc.mimeType)) {
      return (
        <AudioPlayer
          style={mergedStyle}
          src={videoOrImageSrc.url}
          poster={possiblePosterSrc.url}
          requireInteraction={requireInteraction}
          {...restProps}
        />
      )
    } else if (videoOrImageSrc.mimeType.startsWith('image/')) {
      return (
        <img
          style={mergedStyle}
          src={videoOrImageSrc.url}
          alt={alt}
          ref={ref as unknown as React.LegacyRef<HTMLImageElement>}
          {...restProps}
        />
      )
    }
    return (
      <LinkPlayer
        style={mergedStyle}
        src={videoOrImageSrc.url}
        alt={alt}
        ref={ref as unknown as React.Ref<HTMLAnchorElement>}
        {...restProps}
      />
    )
  }
)

interface MediaType {
  url?: string
  mimeType?: string
}

/**
 * @param uri - the uri to resolve (can be a url or a ipfs://\<cid\>)
 * @returns the fully resolved url + mime type of the media
 *
 * @example
 * Usage with fully formed url:
 * ```jsx
 * const Component = () => {
 *   const resolved = useResolvedMediaType("https://example.com/video.mp4");
 *   console.log("mime type", resolved.data.mimeType);
 *   console.log("url", resolved.data.url);
 *   return null;
 * }
 * ```
 *
 * Usage with ipfs cid:
 * ```jsx
 * const Component = () => {
 *   const resolved = useResolvedMediaType("ipfs://QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvsd");
 *   console.log("mime type", resolved.data.mimeType);
 *   console.log("url", resolved.data.url);
 *   return null;
 * }
 * ```
 */
function useResolvedMediaType(uri?: string) {
  const resolvedUrl = useMemo(() => resolveIpfsUri(uri), [uri])
  const resolvedMimType = useQuery(
    ['mime-type', resolvedUrl],
    () => resolveMimeType(resolvedUrl),
    {
      enabled: !!resolvedUrl,
    }
  )

  return {
    url: resolvedUrl,
    mimeType: resolvedMimType.data,
  }
}

export default MediaRenderer
