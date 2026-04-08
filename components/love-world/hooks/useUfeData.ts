'use client'
import * as React from 'react'

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useApi<T>(fetcher: () => Promise<T>, deps: any[] = []): UseApiResult<T> {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetch = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (e: any) {
      const msg: string = e?.message || 'Something went wrong'
      // 404 = resource doesn't exist yet — treat as null data, not an error
      if (msg.includes('404') || msg.includes('Not Found')) {
        setData(null)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
