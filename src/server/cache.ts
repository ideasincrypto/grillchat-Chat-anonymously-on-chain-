import { getRedisConfig } from '@/utils/env/server'
import Redis, { RedisOptions } from 'ioredis'

export function createRedisInstance() {
  try {
    const config = getRedisConfig()

    const options: RedisOptions = {
      host: config.host,
      password: config.password,
      port: config.port,

      lazyConnect: true,
      showFriendlyErrorStack: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 0,
      commandTimeout: 250,
      retryStrategy: (times: number) => {
        return Math.min(times * 200, 1000)
      },
    }

    const redis = new Redis(options)

    redis.on('error', (error: unknown) => {
      console.warn(
        '[Redis] Warning, error connecting to redis',
        JSON.stringify(error)
      )
    })

    return redis
  } catch (e) {
    console.error(`[Redis] Could not create a Redis instance`)
    return null
  }
}

export async function redisCallWrapper<T = void>(
  callback: () => Promise<T> | undefined
) {
  try {
    return await callback()
  } catch (err) {
    console.warn('Warning: Redis operation failed', JSON.stringify(err))
    return null
  }
}
