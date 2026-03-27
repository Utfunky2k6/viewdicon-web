import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi, authApi } from '@/lib/api'
import { buildUserProfile } from '@/stores/authStore'
import type { UserProfile } from '@/types'

export function useMe() {
  return useQuery<UserProfile>({
    queryKey: ['me'],
    queryFn:  async () => {
      const raw = await authApi.me()
      return buildUserProfile(raw)
    },
    retry:    false,
    staleTime: 5 * 60_000,
  })
}

export function usePublicProfile(username: string) {
  return useQuery<UserProfile>({
    queryKey: ['profile', username],
    queryFn:  async () => {
      const raw = await profileApi.get(username) as Record<string, unknown>
      return buildUserProfile(raw)
    },
    enabled:  !!username,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => profileApi.update(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}
