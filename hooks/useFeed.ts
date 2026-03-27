import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feedApi } from '@/lib/api'
import type { PotPost } from '@/types'

export function useFeed(type?: string) {
  return useQuery<PotPost[]>({
    queryKey: ['feed', type ?? 'all'],
    queryFn:  () => feedApi.list(type) as Promise<PotPost[]>,
    staleTime: 30_000,
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { content: string; feedType: string; villageId?: string }) =>
      feedApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  })
}

export function useReactToPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, action }: { postId: string; action: string }) =>
      feedApi.react(postId, action),
    onMutate: async ({ postId, action }) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: ['feed'] })
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  })
}
